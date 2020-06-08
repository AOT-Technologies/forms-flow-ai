from flask_restplus import Namespace, fields

class FormIOTokenDto:
    api = Namespace('formiotoken', description='formiotoken')
    token = api.model('formiotoken', {
        'keycloak_role': fields.String(required=True, description='role in keycloak'),
        'formio_token': fields.String(required=True, description='formio token'),
        'formio_role': fields.String(required=True, description='role in formio')
    })


class ApplicationDto:
    api = Namespace('application', description='application related operations')
    application = api.model('application', {
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


class NewApplicationDto:
    api = Namespace('newapplication', description='application related operations')
    newapplication = api.model('newapplication', {
        'form_id': fields.String(required=True, description='Form id'),
        'form_name': fields.String(required=True, description='Form name'),
        'form_revision_number': fields.String(required=True, description='Form Revision Number'),
        'process_definition_key': fields.String(required=True, description='Process Defin ition Key'),
        'process_name': fields.String(required=True, description='Process Name'),
        'comments': fields.String(required=True, description='Comments'),
        'created_by': fields.String(required=True, description='Created by'),
        'created_on': fields.DateTime(required=True, description='Created on'),
        'modified_by': fields.String(required=True, description='Modified by'),
        'modified_on': fields.DateTime(required=True, description='Modified on'),
        'tenant_id': fields.String(required=True, description='Tenant id')

    })


class ProcessDto:
    api = Namespace('process', description='process related operations')
    process = api.model('process', {
        'form_id': fields.Integer(required=True, description='Form id'),
        'mapper_id': fields.String(required=True, description='Mapper id'),
        'form_name': fields.String(required=True, description='Form name'),
        'form_revision_number': fields.String(required=True, description='Form Revision Number'),
        'process_definition_key': fields.String(required=True, description='Process Defin ition Key'),
        'process_name': fields.String(required=True, description='Process Name'),
        'comments': fields.String(required=True, description='Comments'),
        'created_by': fields.String(required=True, description='Created by'),
        'created_on': fields.DateTime(required=True, description='Created on'),
        'modified_by': fields.String(required=True, description='Modified by'),
        'modified_on': fields.DateTime(required=True, description='Modified on'),
        'tenant_id': fields.String(required=True, description='Tenant id')

    })


class SubmissionDto:
    api = Namespace('submission', description='application submission related operations')
    submission = api.model('application', {
        'application_id': fields.Integer(required=True, description='Application id'),
        'application_name': fields.String(required=True, description='Application name'),
        'application_status': fields.String(required=True, description='Application status'),
        'mapper_id': fields.Integer(required=True, description='Mapper id'),
        'created_by': fields.String(required=True, description='Created by'),
        'created_on': fields.DateTime(required=True, description='created_on'),
        'modified_by': fields.String(required=True, description='Modified by'),
        'modified_on': fields.DateTime(required=True, description='Modified on'),
        'submission_id': fields.String(required=True, description='Submission id'),
        'process_instance_id': fields.String(description='Process Instance Id'),
        'revision_no': fields.Integer(required=True, description='Revision_no')
    })


class NewSubmissionsDto:
    api = Namespace('newsubmission', description='application submission related operations')
    newsubmission = api.model('newsubmission', {
        'application_name': fields.String(required=True, description='Application name'),
        'application_status': fields.String(required=True, description='Application status'),
        'mapper_id': fields.Integer(required=True, description='Mapper id'),
        'created_by': fields.String(required=True, description='Created by'),
        'created_on': fields.DateTime(required=True, description='created_on'),
        'modified_by': fields.String(required=True, description='Modified by'),
        'modified_on': fields.DateTime(required=True, description='Modified on'),
        'submission_id': fields.String(required=True, description='Submission id'),
        'process_instance_id': fields.String(description='Process Instance Id'),
        'revision_no': fields.Integer(required=True, description='Revision_no')
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
