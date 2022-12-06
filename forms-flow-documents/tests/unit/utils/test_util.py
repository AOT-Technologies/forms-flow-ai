"""Test suite for Document utility module."""
import pytest
from formsflow_api_utils.exceptions import BusinessException

from src.formsflow_documents.utils import DocUtils


class TestDocUtils:
    """Tests suite for DocUtils class."""

    def test_b64decode_for_invalid_input(self, app):
        """Test b64decode method to raise exception for nvalid input."""
        with pytest.raises(TypeError):
            DocUtils.b64decode()
        with pytest.raises(BusinessException):
            DocUtils.b64decode("+-")
