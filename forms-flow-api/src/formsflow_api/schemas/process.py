"""This manages process Response Schema."""

from marshmallow import EXCLUDE, Schema, fields


class ProcessListSchema(Schema):
    """This class manages processlist response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    key = fields.Str()
    name = fields.Str()


class ProcessDefinitionSchema(Schema):
    """This class manages process definition response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    key = fields.Str()
    name = fields.Str()
    variables = fields.Str()


class ProcessActionListSchema(Schema):
    """This class manages process action list response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Str()
    actiontype = fields.Str()


class ProcessDefinitionXMLSchema(Schema):
    """This class manages process definition response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Str()
    processXml = fields.Str(data_key="bpmn20Xml", attribute="bpmn20Xml")


class ProcessMessageSchema(Schema):
    """This class manages process definition response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    messageName = fields.Str()
    processInstanceId = fields.Str()


class ProcessActivityInstanceSchema(Schema):
    """This class manages task response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    process_instance_id = fields.Str(
        data_key="processInstanceId", attribute="processInstanceId"
    )
    childActivityInstances = fields.Str(
        data_key="childActivityInstances", attribute="childActivityInstances"
    )
