"""This manages user request Schema."""

from marshmallow import EXCLUDE, Schema, fields


class UserlocaleReqSchema(Schema):
    """This is a general class for user locale request schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    locale = fields.Str(data_key="locale", required=True)


class UserPermissionUpdateSchema(Schema):
    """Schema for user role / group permissions."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        fields = ("realm", "userId", "groupId", "name")
        unknown = EXCLUDE

    userId = fields.Str(data_key="userId", required=True)
    groupId = fields.Str(data_key="groupId", required=True)
    name = fields.Str(data_key="name", required=True)


class UsersListSchema(Schema):
    """Schema for user list."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        fields = ("firstName", "lastName", "email", "id", "username", "role")
        unknown = EXCLUDE


class AddUserRoleSchema(Schema):
    """Schema for add user role."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields."""

        unknown = EXCLUDE

    role_id = fields.Str(data_key="roleId", required=True)
    name = fields.Str(data_key="name", required=True)


class TenantUserAddSchema(Schema):
    """Schema for add user to tenant."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    user = fields.Str(data_key="user", required=True)
    roles = fields.List(fields.Nested(AddUserRoleSchema))


class UserSchema(Schema):
    """Schema for user data."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    default_filter = fields.Int(data_key="defaultFilter", allow_none=True)
    default_submissions_filter = fields.Int(
        data_key="defaultSubmissionsFilter", allow_none=True
    )
    locale = fields.Str(data_key="locale")
    user_name = fields.Str(data_key="userName", dump_only=True)
