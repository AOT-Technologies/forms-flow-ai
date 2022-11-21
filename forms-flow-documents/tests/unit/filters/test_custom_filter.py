"""Tests for custom template filters."""
import pytest  # noqa

from formsflow_documents.filters import is_b64image
from tests.utilities.utils import get_valid_b64images

image_params = get_valid_b64images()


def test_is_b64image():
    """Test for is_b64image template filter."""
    for image in image_params:
        assert is_b64image(image) is True
