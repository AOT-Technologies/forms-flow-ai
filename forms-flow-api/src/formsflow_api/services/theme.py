"""This exposes theme service."""

from http import HTTPStatus
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils.user_context import UserContext, user_context
from formsflow_api.schemas import ThemeCustomizationSchema
from formsflow_api.models import ThemeCustomization



class ThemeCustomizationService:
    """This class manages theme service."""

    @staticmethod
    @user_context
    def create_theme(data, **kwargs):
        """Create new theme entry."""
        user: UserContext = kwargs["user"]
        data["created_by"] = user.user_name
        # data["tenant"] = user.tenant_key
        data["tenant"] = "Abi"
        result = ThemeCustomizationSchema().dump(data)
        return ThemeCustomization.create_theme(result)

    @staticmethod
    @user_context
    def get_theme(**kwargs):
        """Return theme using tenant key else default theme."""
        user: UserContext = kwargs["user"]
        theme = ThemeCustomization.get_theme(user.tenant_key)
        result = ThemeCustomizationSchema().dump(theme)
        return result

    @staticmethod
    @user_context
    def update_theme(data, **kwargs):
        """updates theme"""
        user: UserContext = kwargs["user"]
        # theme = ThemeCustomization.get_theme(user.tenant_key)
        theme = ThemeCustomization.get_theme("Abijith")
        if theme:
            theme.update(data)
        else:
            raise HTTPStatus.NOT_FOUND
        return theme
