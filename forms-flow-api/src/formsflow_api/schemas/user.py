"""This manages user request Schema."""

import re

from marshmallow import EXCLUDE, Schema, fields, validates, ValidationError


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


class UserProfileAttributesSchema(Schema):
    """Schema for user profile attributes."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    locale = fields.List(fields.Str(), data_key="locale")


class UserProfileUpdateSchema(Schema):
    """Schema for user profile update request.

    All fields are optional - only fields with changed values are sent.
    """

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    first_name = fields.Str(data_key="firstName", allow_none=False)
    last_name = fields.Str(data_key="lastName", allow_none=False)
    username = fields.Str(data_key="username", allow_none=False)
    email = fields.Str(data_key="email", allow_none=False)
    attributes = fields.Nested(UserProfileAttributesSchema, data_key="attributes")

    @validates("email")
    def validate_email(self, value):
        """Validate email format if provided."""
        if value is not None and not value.strip():
            raise ValidationError("Email cannot be empty")
        if value is not None and value.strip():
            # Basic email regex pattern
            email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
            if not re.match(email_pattern, value):
                raise ValidationError("Invalid email format")

    @validates("first_name")
    def validate_first_name(self, value):
        """Validate first_name is not empty if provided."""
        if value is not None and not value.strip():
            raise ValidationError("First name cannot be empty")

    @validates("last_name")
    def validate_last_name(self, value):
        """Validate last_name is not empty if provided."""
        if value is not None and not value.strip():
            raise ValidationError("Last name cannot be empty")

    @validates("username")
    def validate_username(self, value):
        """Validate username is not empty if provided."""
        if value is not None and not value.strip():
            raise ValidationError("Username cannot be empty")
