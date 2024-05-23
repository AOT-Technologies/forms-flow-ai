"""This exposes theme service."""

from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.models import Themes
from formsflow_api.schemas import ThemeCustomizationSchema

theme_schema = ThemeCustomizationSchema()


class ThemeCustomizationService:
    """This class manages theme service."""

    @staticmethod
    @user_context
    def create_theme(data, **kwargs):
        """Create new theme entry."""
        user: UserContext = kwargs["user"]
        tenant = user.tenant_key
        data["created_by"] = user.user_name
        data["tenant"] = tenant
        theme = Themes.get_theme(tenant)
        if theme:
            raise BusinessException(BusinessErrorCode.THEME_EXIST)
        theme_customization = Themes.create_theme(data)
        return theme_schema.dump(theme_customization)

    @staticmethod
    def get_theme(tenant_key):
        """Return theme using tenant key else default theme."""
        theme = Themes.get_theme(tenant_key)
        result = theme_schema.dump(theme)
        if result:
            return result
        raise BusinessException(BusinessErrorCode.THEME_NOT_FOUND)

    @staticmethod
    @user_context
    def update_theme(data, **kwargs):
        """Updates theme."""
        user: UserContext = kwargs["user"]
        theme = Themes.get_theme(user.tenant_key)
        if theme:
            theme.update(data)
            return theme
        raise BusinessException(BusinessErrorCode.THEME_NOT_FOUND)
