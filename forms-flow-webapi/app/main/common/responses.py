from flask import jsonify

class response(object):
    success_code = 200
    success_message = "Success"

    error_code = 500
    error_message = "Internal server error"

    notfound_code = 404
    notfound_message = "Not found"

    created_code = 201
    created_message = "Sucessfully added"

    alreadyexisting_code = 409
    alreadyexisting_message = "Already exits"

    nodata_code = 417
    nodata_message = "No data found"

    success_response = {
    'status': 'success',
    'message': 'Successfully added.'
    }

    fail_object = {
    'status': 'fail',
    'message': 'User already exists. Please Log in.',
    }

def errorResponse(message=''):
   return jsonify( { 'STATUS':'ERROR','MESSAGE': message } )