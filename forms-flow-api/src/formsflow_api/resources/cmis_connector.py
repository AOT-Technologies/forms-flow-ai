"""API endpoints for managing cms repo."""

import mimetypes
from http import HTTPStatus

from cmislib.exceptions import UpdateConflictException
from cmislib.model import CmisClient
from flask import current_app, request
from flask_restx import Namespace, Resource

from formsflow_api.services.external.cmislib.atompub.binding import (
    AtomPubBinding,
)
from formsflow_api.utils import auth, cors_preflight, profiletime

# keeping the base path same for cmis operations (upload / download) as cmis/

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
            return {
                "message": "CMS Repo Url is not configured"
            }, HTTPStatus.INTERNAL_SERVER_ERROR

        args = {"binding": AtomPubBinding()}
        client = CmisClient(cms_repo_url, cms_repo_username, cms_repo_password, **args)
        repo = client.defaultRepository
        results = repo.query("select * from cmis:folder where cmis:name = 'uploads'")
        if len(results) == 0:
            root_folder = repo.rootFolder
            uploads = root_folder.createFolder("uploads")
        else:
            uploads = repo.getObjectByPath("/uploads")

        if "upload" not in request.files:
            return {"message": "No upload files in the request"}, HTTPStatus.BAD_REQUEST

        contentfile = request.files["upload"]
        filename = contentfile.filename
        content_type = mimetypes.guess_type(filename)[0]
        if filename != "":
            try:
                document = uploads.createDocument(
                    filename, contentFile=contentfile, contentType=content_type
                )
                api_base_url = current_app.config.get("FORMSFLOW_API_URL")
                url = f"{api_base_url}/download/?name={document.name}"
                return (
                    (
                        {
                            "objectId": document.getObjectId(),
                            "name": document.name,
                            "url": url,
                        }
                    ),
                    HTTPStatus.OK,
                )
            except UpdateConflictException:
                return {
                    "message": "The uploaded file already existing in the repository"
                }, HTTPStatus.INTERNAL_SERVER_ERROR
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
            return {
                "message": "CMS Repo Url is not configured"
            }, HTTPStatus.INTERNAL_SERVER_ERROR

        client = CmisClient(cms_repo_url, cms_repo_username, cms_repo_password)
        repo = client.defaultRepository
        args = request.args
        try:
            results = repo.query(
                "select * from cmis:document where cmis:name = '"
                + args.get("name")
                + "'"
            )
            if len(results) == 0:
                return {
                    "message": "No file data found"
                }, HTTPStatus.INTERNAL_SERVER_ERROR
            result = results[0]
            data = result.getContentStream().read()
            binary_data = "".join(
                format(i, "08b") for i in bytearray(data, encoding="utf-8")
            )
            return [{"name": result.name, "data": binary_data}]
        except AssertionError:
            return {"message": "No file data found"}, HTTPStatus.INTERNAL_SERVER_ERROR
        except BaseException as exc:  # pylint: disable=broad-except
            current_app.logger.warning(exc)
            return {
                "message": "CMS Repo related Exception occurred"
            }, HTTPStatus.INTERNAL_SERVER_ERROR
