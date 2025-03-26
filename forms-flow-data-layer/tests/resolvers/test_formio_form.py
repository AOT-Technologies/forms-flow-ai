from typing import List

import pytest

from src.graphql.resolvers.formio_form_resolvers import FormResolver
from src.graphql.schema import FormSchema
from src.graphql.service import FormService


@pytest.fixture
def form_resolver():
    return FormResolver()


@pytest.fixture
def mock_form():
    return FormSchema(
        id="test_form_id",
        title="Test Form",
        type="form",
        name="test_form",
        path="test",
        display="form",
    )


class TestFormResolver:
    @pytest.mark.asyncio
    async def test_forms(self, form_resolver, mock_form, mocker):
        # Mock the FormService.get_forms method
        mock_forms = [mock_form]
        mocker.patch.object(FormService, "get_forms", return_value=mock_forms)

        # Test default parameters
        result = await form_resolver.forms()
        assert isinstance(result, List)
        assert len(result) == 1
        assert result[0].id == mock_form.id
        assert result[0].title == mock_form.title

        # Verify the service was called with correct parameters
        FormService.get_forms.assert_called_once_with(
            skip=0, limit=100, type_filter=None
        )

    @pytest.mark.asyncio
    async def test_forms_with_filters(self, form_resolver, mock_form, mocker):
        # Mock the FormService.get_forms method
        mock_forms = [mock_form]
        mocker.patch.object(FormService, "get_forms", return_value=mock_forms)

        # Test with custom parameters
        result = await form_resolver.forms(skip=10, limit=50, type_filter="form")
        assert isinstance(result, List)
        assert len(result) == 1

        # Verify the service was called with correct parameters
        FormService.get_forms.assert_called_once_with(
            skip=10, limit=50, type_filter="form"
        )

    @pytest.mark.asyncio
    async def test_form_by_id(self, form_resolver, mock_form, mocker):
        # Mock the FormService.get_form method
        mocker.patch.object(FormService, "get_form", return_value=mock_form)

        # Test getting form by id
        result = await form_resolver.form_by_id("test_form_id")
        assert result is not None
        assert result.id == mock_form.id
        assert result.title == mock_form.title

        # Verify the service was called with correct parameters
        FormService.get_form.assert_called_once_with(form_id="test_form_id")

    @pytest.mark.asyncio
    async def test_form_by_id_not_found(self, form_resolver, mocker):
        # Mock the FormService.get_form method to return None
        mocker.patch.object(FormService, "get_form", return_value=None)

        # Test getting non-existent form
        result = await form_resolver.form_by_id("non_existent_id")
        assert result is None

        # Verify the service was called with correct parameters
        FormService.get_form.assert_called_once_with(form_id="non_existent_id")
