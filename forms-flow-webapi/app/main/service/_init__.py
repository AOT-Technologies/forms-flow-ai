from ...main.controller.application_controller import api as application
from ...main.controller.application_controller import createapi as createapplication
from ...main.controller.submission_controller import submissionapi as submissions
from ...main.controller.submission_controller import createsubmissionapi as submission
from ...main.controller.formiotoken_controller import api as formiotoken
from ...main.controller.process_controller import api as process

def init_endpoints(api):
   api.add_namespace(formiotoken, path='/getformiotoken')
   api.add_namespace(application, path='/application')
   api.add_namespace(createapplication, path='/application')
   api.add_namespace(submissions, path='/application')
   api.add_namespace(submission, path='/application')
   api.add_namespace(process, path='/process')