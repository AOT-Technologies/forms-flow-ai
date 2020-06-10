from flask_restx import Namespace, fields


class FormIOTokenDto:
    api = Namespace('formiotoken', description='formiotoken')
    token = api.model('formiotoken', {
        'keycloak_role': fields.String(required=True, description='role in keycloak'),
        'formio_token': fields.String(required=True, description='formio token'),
        'formio_role': fields.String(required=True, description='role in formio')
    })


class TaskDto:
    api = Namespace('task', description='task related operations')
    task = api.model('task', {
        'form_id': fields.Integer(required=True, description='Form id'),
        'mapper_id': fields.String(required=True, description='Mapper id'),
        'form_name': fields.String(required=True, description='Form name'),
        'form_revision_number': fields.String(required=True, description='Form Revision Number'),
        'process_definition_key': fields.String(required=True, description='Process Defin ition Key'),
        'process_name': fields.DateTime(required=True, description='Process Name'),
        'comments': fields.DateTime(required=True, description='Comments'),
        'created_by': fields.String(required=True, description='Created by'),
        'created_on': fields.DateTime(required=True, description='Created on'),
        'modified_by': fields.String(required=True, description='Modified by'),
        'modified_on': fields.DateTime(required=True, description='Modified on'),
        'tenant_id': fields.String(required=True, description='Tenant id')

    })
