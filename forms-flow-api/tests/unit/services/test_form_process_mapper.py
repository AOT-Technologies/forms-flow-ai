"""Tests to assure the FormProcessMapper Service."""

from formsflow_api.services import FormProcessMapperService

# from tests.utilities.base_test import get_form_service_payload

form_service = FormProcessMapperService()


def test_get_form_mapper_count(app, client, session):
    """Tets the get_mapper_count method."""
    rv = form_service.get_mapper_count()
    assert not rv
    assert isinstance(rv, int)
