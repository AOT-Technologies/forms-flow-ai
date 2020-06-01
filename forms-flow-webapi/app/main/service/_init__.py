from ...main.controller.user_controller import api as user

def init_endpoints(api):
    api.add_namespace(user, path='/user')