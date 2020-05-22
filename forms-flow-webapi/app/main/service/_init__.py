from ...main.controller.user_controller import api as user
from ...main.controller.application_controller import api as application
from ...main.controller.application_controller import createapi as createapplication

def init_endpoints(api):
   api.add_namespace(user, path='/user')
   api.add_namespace(application, path='/application')
   api.add_namespace(createapplication, path='/application')