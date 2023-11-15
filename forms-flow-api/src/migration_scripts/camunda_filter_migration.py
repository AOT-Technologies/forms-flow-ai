"""Migrating existing camunda task filters."""

import json
import os

import requests
from bpm import BPMEndpointType, get_headers, get_url
from flask import current_app

from formsflow_api.models import Filter


def migrate_filters(tenant_key):
    """To migrate existing camunda task filters."""
    current_app.logger.info("Migrating existing camunda task filters...")
    headers = get_headers(tenant_key)
    filter_url = get_url(BPMEndpointType.FILTER_LIST)
    response = requests.get(filter_url, headers=headers)
    current_app.logger.debug(f"Fetching task filters from: {filter_url}")
    current_app.logger.debug(f"Filters response status: {response.status_code}")
    filter_list = json.loads(response.text)
    permission_url = get_url(BPMEndpointType.FILTER_PERMISSION)
    enable_client_auth = (
        str(os.getenv("KEYCLOAK_ENABLE_CLIENT_AUTH", default="false")).lower() == "true"
    )
    for filter_data in filter_list:
        filter_obj = Filter()
        filter_obj.name = filter_data.get("name")
        filter_obj.variables = filter_data.get("properties").pop("variables", {})
        filter_obj.properties = filter_data.get("properties")
        filter_obj.criteria = filter_data.get("query")
        filter_obj.status = "active"
        filter_obj.tenant = tenant_key
        resourceId = filter_data.get("id")
        url = permission_url + f"&resourceId={resourceId}"
        response = requests.get(url, headers=headers)
        filter_permission = json.loads(response.text)
        current_app.logger.debug(f"Fetching filter permission from {url}")
        current_app.logger.debug(
            f"Filter permission response status: {response.status_code}"
        )
        groups = []
        users = []
        for item in filter_permission:
            if item["resourceId"] == filter_data.get("id"):
                if item["userId"] == "*":
                    break
                if item["groupId"]:
                    group = (
                        item["groupId"] if enable_client_auth else f"/{item['groupId']}"
                    )
                    groups.append(group)
                if item["userId"]:
                    users.append(item["userId"])
        filter_obj.roles = groups
        filter_obj.users = users
        filter_obj.created_by = "service-account-forms-flow-bpm"
        filter_obj.task_visible_attributes = {
            "applicationId": True,
            "dueDate": True,
            "priority": True,
            "assignee": True,
            "taskTitle": True,
            "createdDate": True,
            "groups": True,
            "followupDate": True,
        }
        filter_obj.save()
