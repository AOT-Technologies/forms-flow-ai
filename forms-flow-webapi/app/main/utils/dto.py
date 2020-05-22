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
        'id': fields.String(required=True, description='Application id'),
        'name': fields.String(required=True, description='Application name'),
        'process_definition_key': fields.String(description='Process definition key'),
        'process_name': fields.String(required=True,description='Process name'),
        'form_id': fields.String(required=True,description='Form id'),
        'form_name': fields.String(description='Form name'),
        'created_by': fields.String(description='Created by'),
        'created_on': fields.DateTime(description='Created on'),
        'status': fields.String(description='Status'),
        'comments': fields.String(description='Comments'),
        'updated_on': fields.DateTime(description='Updated on')
    })
class NewApplicationsDto:
    api = Namespace('newapplication', description='application related operations')
    newapplication = api.model('newapplication', {
        'name': fields.String(required=True, description='Application name'),
        'process_definition_key': fields.String(description='Process definition key'),
        'process_name': fields.String(required=True,description='Process name'),
        'form_id': fields.String(required=True,description='Form id'),
        'form_name': fields.String(description='Form name'),
        'created_by': fields.String(description='Created by'),
        'created_on': fields.DateTime(description='Created on'),
        'status': fields.String(description='Status'),
        'comments': fields.String(description='Comments'),
        'updated_on': fields.DateTime(description='Updated on')
    })

