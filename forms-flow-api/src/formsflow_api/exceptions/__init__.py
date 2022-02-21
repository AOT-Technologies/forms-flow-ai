"""Application Specific Exceptions, to manage the business errors.

BusinessException - error, status_code - Business rules error
error - a description of the error {code / description: classname / full text}
status_code - where possible use HTTP Error Codes
"""


class BusinessException(Exception):
    """Exception that adds error code and error."""

    def __init__(self, error, status_code, *args, **kwargs):
        """Return a valid BusinessException."""
        super().__init__(*args, **kwargs)
        self.error = error
        self.status_code = status_code
