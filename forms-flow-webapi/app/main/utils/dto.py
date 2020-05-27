from flask_restplus import Namespace, fields


class UserDto:
    api = Namespace('user', description='user related operations')
    user = api.model('user', {
        'email': fields.String(required=True, description='user email address'),
        'username': fields.String(required=True, description='user username'),
        'password': fields.String(required=True, description='user password'),
        'public_id': fields.String(description='user Identifier')
    })

class ApplicationDto:
    api = Namespace('application', description='application related operations')
    application = api.model('application', {
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
class NewApplicationsDto:
    api = Namespace('newapplication', description='application related operations')
    newapplication = api.model('newapplication', {
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

