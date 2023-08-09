import os
import sys
import json
import datetime
import requests
from formsflow_api.models import Authorization
from formsflow_api.models import FormProcessMapper
from formsflow_api.models.db import db
from sqlalchemy import func
from formsflow_api import create_app


def find_latest_forms(workflow=None):
    """Find latest forms from the mapper table based on camunda resource id"""
    filtered_form_query = (
        db.session.query(func.max(FormProcessMapper.id).label("id"))
        .group_by(FormProcessMapper.parent_form_id)
        .all()
    )
    filtered_form_ids = [data.id for data in filtered_form_query]
    query = FormProcessMapper.query.filter(
        FormProcessMapper.id.in_(filtered_form_ids),
        FormProcessMapper.deleted.is_(False),
    )
    if workflow:
        query = query.filter(FormProcessMapper.process_key == workflow)
    return query.all()


def is_form_exists(parent_form_id, auth_type, tenant: str = None):
    """To check whether the form already exist in the authorization table"""
    query = Authorization.query.filter(
        Authorization.resource_id == str(parent_form_id)
    ).filter(Authorization.auth_type == auth_type)
    if tenant:
        query = query.filter(Authorization.tenant == tenant)
    return query.one_or_none()


def migrate_authorization(auth_type):
    """To migrate all existing camunda authorizations"""
    bpm_token_api = os.getenv("BPM_TOKEN_API")
    bpm_client_id = os.getenv("BPM_CLIENT_ID")
    bpm_client_secret = os.getenv("BPM_CLIENT_SECRET")
    bpm_grant_type = os.getenv("BPM_GRANT_TYPE", "client_credentials")
    bpm_api_base = os.getenv("BPM_API_URL")
    enable_client_auth = (
        str(os.getenv("KEYCLOAK_ENABLE_CLIENT_AUTH", default="false")).lower() == "true"
    )

    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    payload = {
        "client_id": bpm_client_id,
        "client_secret": bpm_client_secret,
        "grant_type": bpm_grant_type,
    }
    response = requests.post(bpm_token_api, headers=headers, data=payload)
    data = json.loads(response.text)
    url = f"{bpm_api_base}/engine-rest-ext/v1/admin/form/authorization"
    headers = {
        "Authorization": "Bearer " + data["access_token"],
        "Content-Type": "application/json",
    }
    response = requests.get(url, headers=headers)
    data = json.loads(response.text)
    authorization_list = data["authorizationList"]
    authorization_list = authorization_list if authorization_list is not None else []
    for auth in authorization_list:
        resource_id = auth["resourceId"]
        roles = auth["groupId"]
        roles = roles if enable_client_auth else f"/{roles}"
        if resource_id == "*":
            forms = find_latest_forms()
        else:
            forms = find_latest_forms(resource_id)
        for form in forms:
            formId = form.parent_form_id
            is_form_exist = is_form_exists(formId, auth_type)
            if is_form_exist is None:
                is_form_exist = Authorization(
                    auth_type=auth_type,
                    resource_id=form.parent_form_id,
                    roles=[roles],
                    tenant=form.tenant,
                    created=datetime.datetime.now(),
                    created_by=form.created_by,
                )
            else:
                if roles not in is_form_exist.roles:
                    is_form_exist.roles = [*is_form_exist.roles, roles]
                    is_form_exist.modified = datetime.datetime.now()
            auth = is_form_exist.save()


def run(auth_type):
    """Run the job."""
    application = create_app()
    application.app_context().push()
    migrate_authorization(auth_type)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        argument = "form"
    else:
        argument = sys.argv[1]
    auth_type = (
        "APPLICATION"
        if argument.lower() == "application"
        else (
            "FORM"
            if argument.lower() == "form"
            else sys.exit("Unsupported argument. Please use 'application' or 'form'.")
        )
    )

    run(auth_type)
