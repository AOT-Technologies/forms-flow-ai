import os
import json
import datetime
import requests
from formsflow_api.models import Authorization
from formsflow_api.models import FormProcessMapper
from formsflow_api.models.db import db
from sqlalchemy import func
from formsflow_api import create_app

def find_latest_forms(workflow=None):
        """"Find latest forms from the mapper table based on camunda resource id"""
        filtered_form_query = (
        db.session.query(
            func.max(FormProcessMapper.id).label("id")
        )
        .group_by(FormProcessMapper.parent_form_id)
        .all()
        )
        filtered_form_ids = [data.id for data in filtered_form_query]
        query = FormProcessMapper.query.filter(
        FormProcessMapper.id.in_(filtered_form_ids),
        FormProcessMapper.deleted.is_(False)
        )
        if workflow:
            query = query.filter(FormProcessMapper.process_key == workflow)
        return query.all()

def is_form_exist(parent_form_id,auth_type,tenant: str = None):
        """"To check whether the form already exist in the authorization table"""
        query = (
            query.filter(Authorization.resource_id == str(parent_form_id))
            .filter(Authorization.auth_type == auth_type)
        )
        if tenant:
            query = query.filter(Authorization.tenant == tenant)
        return query.one_or_none()

def migrate_authorization():
    """To migrate all existing camunda authorizations"""
    bpm_token_api = os.getenv("BPM_TOKEN_API")
    bpm_client_id = os.getenv("BPM_CLIENT_ID")
    bpm_client_secret = os.getenv("BPM_CLIENT_SECRET")
    bpm_grant_type = os.getenv("BPM_GRANT_TYPE","client_credentials")
    bpm_api_base = os.getenv("BPM_API_URL")

    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    payload = {
        "client_id": bpm_client_id,
        "client_secret": bpm_client_secret,
        "grant_type": bpm_grant_type,
    }
    response = requests.post(
        bpm_token_api, headers=headers, data=payload
    )
    data = json.loads(response.text)
    url = f"{bpm_api_base}/engine-rest-ext/v1/admin/form/authorization"
    headers = {
        "Authorization": "Bearer " + data["access_token"],
        "Content-Type": "application/json",
    }
    response = requests.get(url,headers=headers)
    data = json.loads(response.text)
    authorization_list = data['authorizationList']
    auth_type = 'FORM'
    for auth in authorization_list:
        resource_id = auth['resourceId']
        roles = auth['groupId']
        roles = f'/{roles}'
        if resource_id == "*":
            forms = find_latest_forms()
        else:
            forms = find_latest_forms(resource_id)
        for form in forms:
            formId = form.parent_form_id
            is_form_exist = Authorization.is_form_exist(formId, "FORM")
            if is_form_exist is None:
                is_form_exist = Authorization(
                    auth_type=auth_type,
                    resource_id=form.parent_form_id,
                    roles=[roles],
                    created=datetime.datetime.now(),
                    created_by=form.created_by
                )
            else:
                if roles not in is_form_exist.roles:
                    is_form_exist.roles = [*is_form_exist.roles, roles]
                    is_form_exist.modified = datetime.datetime.now()
            auth = is_form_exist.save()

def run():
    """Run the job."""
    application = create_app()
    application.app_context().push()
    migrate_authorization()

if __name__ == "__main__":
    run()