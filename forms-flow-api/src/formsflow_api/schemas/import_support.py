"""This manages Import Schema."""

from marshmallow import EXCLUDE, Schema, fields

form_workflow_schema = {
    "title": "Form Workflow Schema",
    "type": "object",
    "properties": {
        "forms": {
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "object",
                "properties": {
                    "formTitle": {"type": "string"},
                    "formDescription": {"type": "string"},
                    "anonymous": {"type": "boolean"},
                    "type": {"type": "string"},
                    "content": {"type": "object"},
                },
                "required": [
                    "formTitle",
                    "formDescription",
                    "content",
                    "anonymous",
                    "type",
                ],
            },
        },
        "workflows": {
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "object",
                "properties": {
                    "processKey": {"type": "string"},
                    "processName": {"type": "string"},
                    "processType": {"type": "string"},
                    "type": {"type": "string"},
                    "content": {"type": "string"},
                },
                "required": [
                    "content",
                    "processKey",
                    "processName",
                    "processType",
                    "type",
                ],
            },
        },
        "authorizations": {
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "object",
                "properties": {
                    "APPLICATION": {
                        "type": "object",
                        "properties": {
                            "resourceId": {"type": "string"},
                            "resourceDetails": {"type": "object"},
                            "roles": {"type": "array", "items": {"type": "string"}},
                            "userName": {"type": ["string", "null"]},
                        },
                        "required": [
                            "resourceId",
                            "resourceDetails",
                            "roles",
                            "userName",
                        ],
                    },
                    "FORM": {
                        "type": "object",
                        "properties": {
                            "resourceId": {"type": "string"},
                            "resourceDetails": {"type": "object"},
                            "roles": {"type": "array", "items": {"type": "string"}},
                            "userName": {"type": ["string", "null"]},
                        },
                        "required": [
                            "resourceId",
                            "resourceDetails",
                            "roles",
                            "userName",
                        ],
                    },
                    "DESIGNER": {
                        "type": "object",
                        "properties": {
                            "resourceId": {"type": "string"},
                            "resourceDetails": {"type": "object"},
                            "roles": {"type": "array", "items": {"type": "string"}},
                            "userName": {"type": ["string", "null"]},
                        },
                        "required": [
                            "resourceId",
                            "resourceDetails",
                            "roles",
                            "userName",
                        ],
                    },
                },
                "required": ["APPLICATION", "FORM", "DESIGNER"],
            },
        },
    },
    "required": ["forms", "workflows", "rules", "authorizations"],
}

form_schema = {
    "title": "Form Schema",
    "type": "object",
    "properties": {
        "forms": {
            "type": "array",
            "properties": {
                "title": {"type": "string"},
                "name": {"type": "string"},
                "path": {"type": "boolean"},
                "type": {"type": "string"},
                "components": {"type": "array"},
            },
            "required": ["title", "name", "path", "type", "components"],
        }
    },
    "additionalProperties": False,
}


class ImportRequestSchema(Schema):
    """This class manages import request schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    import_type = fields.Str(data_key="importType", required=True)
    action = fields.Str(data_key="action", required=True)


class ImportEditRequestSchema(Schema):
    """This class manages import edit request schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    mapper_id = fields.Str(data_key="mapperId", required=True)
    form = fields.Dict(data_key="form")
    workflow = fields.Dict(data_key="workflow")
