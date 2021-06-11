"""Tests to assure the configuration objects.

Test-Suite to ensure that the Configuration Classes are working as expected.
"""

from importlib import reload

import pytest
from forms_flow_api import config


# testdata pattern is ({str: environment}, {expected return value})
TEST_ENVIRONMENT_DATA = [
    ('valid', 'development', config.DevConfig),
    ('valid', 'testing', config.TestConfig),
    ('valid', 'default', config.ProdConfig),
    ('valid', 'production', config.ProdConfig),
    ('error', None, KeyError)
]


@pytest.mark.parametrize('test_type,environment,expected', TEST_ENVIRONMENT_DATA)
def test_get_named_config(test_type, environment, expected):
    """Assert that the named configurations can be loaded.

    Or that a KeyError is returned for missing config types.
    """
    if test_type == 'valid':
        assert isinstance(config.get_named_config(environment), expected)
    else:
        with pytest.raises(KeyError):
            config.get_named_config(environment)


def test_prod_config_secret_key(monkeypatch):
    """Assert that the ProductionConfig is correct.

    The object either uses the SECRET_KEY from the environment,
    or creates the SECRET_KEY on the fly.
    """
    key = 'SECRET_KEY'

    # Assert that secret key will default to some value
    # even if missed in the environment setup
    monkeypatch.delenv(key, raising=False)
    reload(config)
    assert config.ProdConfig().SECRET_KEY is not None

    # Assert that the secret_key is set to the assigned environment value
    monkeypatch.setenv(key, 'SECRET_KEY')
    reload(config)
    assert config.ProdConfig().SECRET_KEY == 'SECRET_KEY'
