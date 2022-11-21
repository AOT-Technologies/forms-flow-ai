"""This exposes form version service."""

from formsflow_api_utils.utils.user_context import UserContext,user_context
import datetime
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api.models import FormVersions
from http import HTTPStatus
from formsflow_api.schemas import FormVersionResponseSchema

class FormVersionService:  # pylint: disable=too-few-public-methods
    """This class manages form version service."""

    @classmethod
    def create_form_Verions(cls, form_id):
        """Creates a form verion."""
        assert form_id is not None
        try:
            FormVersions.create_form_versions()
        except BaseException as version_err:
            raise version_err
        
    @classmethod
    @user_context
    def update_form_Verions(cls, form_id, version_id, form_data, **kwargs):
        """update a form verion with version details."""
        user: UserContext = kwargs["user"]
        user_id: str = user.user_name
        assert form_data is not None and form_id is not None
        version_data={
                "form_id":form_id ,
                "restored": form_data["restored"] if form_data.get("restored") else False,
                "restored_id": form_data.get("restored",""),
        }
        if version_id:
            version_data["version"]= {
                    "version_id": version_id,
                    "created_by": user_id,
                    "created": datetime.datetime.utcnow
                }
        try:
            updated_version_data= FormVersions.update_form_versions(version_data)
            if updated_version_data is None:
                raise BusinessException({"invalid form id"},HTTPStatus.BAD_REQUEST)
        except BaseException as version_err:
                raise version_err
        
    @classmethod
    def get_form_versions(cls,form_id):
        """get form versionss."""
        assert form_id is not None
        response = FormVersions.get_form_versions(form_id)
        if response:
            response_schema = FormVersionResponseSchema()
            response = response_schema.dump(response)
            return response,HTTPStatus.OK
        else:
            return {
                    "type": "Invalid response data",
                    "message": "Invalid Form Id"
                }, HTTPStatus.BAD_REQUEST,
            
           
      

         
           
            
        
        
