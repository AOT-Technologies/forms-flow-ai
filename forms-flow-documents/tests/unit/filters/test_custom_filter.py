"""Tests for custom template filters."""
import pytest

from formsflow_documents.filters import is_b64image
from tests.utilities.utils import get_valid_b64images

image_params = get_valid_b64images()


def test_is_b64image_valid_payload():
    """Test for is_b64image template filter for valid payload."""
    for image in image_params:
        assert is_b64image(image) is True


def test_is_b64image_invalid_payload():
    """Tests is_b64image template filter for invalid payload."""
    assert is_b64image(123) is False
    assert is_b64image("") is False
    assert is_b64image([]) is False
    assert is_b64image({}) is False
    with pytest.raises(TypeError):
        is_b64image()
