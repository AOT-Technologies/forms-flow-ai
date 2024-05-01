"""This exposes theme service."""

from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.models import ThemeCustomization
from formsflow_api.schemas import ThemeCustomizationSchema


class ThemeCustomizationService:
    """This class manages theme service."""

    @staticmethod
    @user_context
    def create_theme(data, **kwargs):
        """Create new theme entry."""
        theme_schema = ThemeCustomizationSchema()
        user: UserContext = kwargs["user"]
        data["created_by"] = user.user_name
        data["tenant"] = user.tenant_key
        theme_customization = ThemeCustomization.create_theme(data)
        result = theme_schema.dump(theme_customization)
        return result

    @staticmethod
    @user_context
    def get_theme(tenant_key):
        """Return theme using tenant key else default theme."""
        theme = ThemeCustomization.get_theme(tenant_key)
        theme_schema = ThemeCustomizationSchema()
        result = theme_schema.dump(theme)
        return result

    @staticmethod
    @user_context
    def update_theme(data, **kwargs):
        """Updates theme."""
        user: UserContext = kwargs["user"]
        theme = ThemeCustomization.get_theme(user.tenant_key)
        if theme:
            theme.update(data)
        return theme
