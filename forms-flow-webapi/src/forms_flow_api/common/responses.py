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


def errorResponse(message=''):
    return jsonify({'CODE': response.error_code, 'STATUS': response.error_message, 'MESSAGE': message, 'DATA': ''})


def successResponse(data=''):
    return jsonify({'CODE': response.success_code, 'STATUS': response.success_message, 'MESSAGE': 'Success.', 'DATA': data})


def successListResponse(data='', total='', pageno='', limit=''):
    return jsonify({'CODE': response.success_code, 'STATUS': response.success_message, 'MESSAGE': 'Success.', 'DATA': data, 'TOTALCOUNT': total, 'PAGENO': pageno, 'LIMIT': limit})


def nodataResponse(message=''):
    return jsonify({'CODE': response.nodata_code, 'STATUS': response.nodata_message, 'MESSAGE': message, 'DATA': ''})
