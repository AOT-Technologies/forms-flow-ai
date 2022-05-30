"""API endpoints for managing cms repo."""

from http import HTTPStatus
import base64

from cmislib.exceptions import UpdateConflictException
from cmislib.model import CmisClient
from flask_restx import Namespace, Resource
from flask import current_app, request
from formsflow_api.utils import (
    auth,
    cors_preflight,
    profiletime,
)

API = Namespace("CMIS", description="CMIS Connector")


@cors_preflight("GET,POST,OPTIONS")
@API.route("/upload", methods=["POST", "OPTIONS"])
class CMISConnectorUploadResource(Resource):
    """Resource for uploading cms repo."""

    @staticmethod
    @auth.require
    @profiletime
    def post():
        """New entry in cms repo with the new resource."""
        cms_repo_url = current_app.config.get("CMS_REPO_URL")
        cms_repo_username = current_app.config.get("CMS_REPO_USERNAME")
        cms_repo_password = current_app.config.get("CMS_REPO_PASSWORD")
        if cms_repo_url is None:
            return {"message": "CMS Repo Url is not configured"}, HTTPStatus.INTERNAL_SERVER_ERROR

        client = CmisClient(cms_repo_url, cms_repo_username, cms_repo_password)
        repo = client.defaultRepository
        results = repo.query("select * from cmis:folder where cmis:name = 'uploads'")
        if len(results) == 0:
            root_folder = repo.rootFolder
            uploads = root_folder.createFolder("uploads")
        else:
            uploads = repo.getObjectByPath("/uploads")

        if 'upload' not in request.files:
            return {"message": "No upload files in the request"}, HTTPStatus.BAD_REQUEST

        content_file = request.files['upload']
        name = content_file.filename
        if content_file.filename != '':
            content_file.read()
            file_data = base64.b64encode(content_file.read())
            try:
                document = uploads.createDocument(name, contentFile=file_data)
                return (
                    (
                        {
                            "objectId": document.getObjectId(),
                            "name": document.name,
                        }
                    ),
                    HTTPStatus.OK,
                )
            except UpdateConflictException:
                return {"message": "The uploaded file already existing in the repository"}, \
                       HTTPStatus.INTERNAL_SERVER_ERROR
        else:
            return {"message": "No upload files in the request"}, HTTPStatus.BAD_REQUEST


@cors_preflight("GET,POST,OPTIONS")
@API.route("/download", methods=["GET", "OPTIONS"])
class CMISConnectorDownloadResource(Resource):
    """Resource for downloading files from cms repo."""

    @staticmethod
    @auth.require
    @profiletime
    def get():
        """Getting resource from cms repo."""
        cms_repo_url = current_app.config.get("CMS_REPO_URL")
        cms_repo_username = current_app.config.get("CMS_REPO_USERNAME")
        cms_repo_password = current_app.config.get("CMS_REPO_PASSWORD")
        if cms_repo_url is None:
            return {"message": "CMS Repo Url is not configured"}, HTTPStatus.INTERNAL_SERVER_ERROR

        client = CmisClient(cms_repo_url, cms_repo_username, cms_repo_password)
        repo = client.defaultRepository
        args = request.args
        try:
            results = repo.query("select * from cmis:document where cmis:name = '"+args.get("name")+"'")
            if len(results) == 0:
                return {"message": "No file data found"}, HTTPStatus.INTERNAL_SERVER_ERROR
            result = results[0]
            return [
                {
                    'name': result.name,
                    'data': result.getContentStream().read()
                }
            ]
        except AssertionError:
            return {"message": "No file data found"}, HTTPStatus.INTERNAL_SERVER_ERROR

