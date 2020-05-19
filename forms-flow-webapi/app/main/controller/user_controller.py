from flask import request
from flask_restplus import Resource

from ..utils.dto import UserDto
from ..service.user_service import save_new_user, get_all_users, get_a_user
from ..common.responses import response

api = UserDto.api
_user = UserDto.user


@api.route('/')
class UserList(Resource):
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('list_of_registered_users')
    @api.marshal_list_with(_user, envelope='data')
    def get(self):
        """List all registered users"""
        return get_all_users()

    @api.response(response().created_code, response().created_message)
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('create a new user')
    @api.expect(_user, validate=True)
    def post(self):
        """Creates a new User """
        data = request.json
        return save_new_user(data=data)


@api.route('/<public_id>')
@api.param('public_id', 'The User identifier')
@api.response(response().error_code, response().error_message)
@api.response(response().notfound_code, response().notfound_message)
class User(Resource):
    @api.doc('get a user')
    @api.marshal_with(_user)
    def get(self, public_id):
        """get a user given its identifier"""
        user = get_a_user(public_id)
        if not user:
            api.abort(404)
        else:
            return user