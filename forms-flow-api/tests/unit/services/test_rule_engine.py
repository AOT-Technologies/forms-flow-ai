"""Tests to assure the Application History Service."""
from typing import Dict, List

import pytest

from formsflow_api.services import RuleEngine

rule_engine = RuleEngine()


@pytest.mark.parametrize(
    "form_bundles, expected_result",
    [
        # invalid key as key should be contact.firstName
        (
            [
                {
                    "id": 1,
                    "formProcessMapperId": "mapper1",
                    "rules": ['firstName == "John"'],
                }
            ],
            [],
        ),
        # Valid key should return the mapper1, as the rule engine checks OR condition if rules are sent as array.
        (
            [
                {
                    "id": 1,
                    "formProcessMapperId": "mapper1",
                    "rules": [
                        'contact.firstName == "John"',
                        'contact.lastName != "Doe"',
                    ],
                }
            ],
            ["mapper1"],
        ),
        # Single AND condition with multiple checks. Both rules should return false.
        (
            [
                {
                    "id": 1,
                    "formProcessMapperId": "mapper1",
                    "rules": ['age > 18 and contact.country == "CA"'],
                },
                {
                    "id": 2,
                    "formProcessMapperId": "mapper2",
                    "rules": ['age < 18 and contact.country == "US"'],
                },
            ],
            [],
        ),
        # Single OR condition with multiple checks. Both rules should return true.
        (
            [
                {
                    "id": 1,
                    "formProcessMapperId": "mapper1",
                    "rules": ['age > 18 and contact.country == "US"'],
                },
                {
                    "id": 2,
                    "formProcessMapperId": "mapper2",
                    "rules": ['age < 18 or contact.country == "US"'],
                },
            ],
            ["mapper1", "mapper2"],
        ),
    ],
)
def test_rule_engine(
    app,
    client,
    form_bundles: List[Dict[str, any]],
    expected_result: List[Dict[str, any]],
):
    """Tests the application history creation with valid payload."""
    data = {
        "contact": {
            "firstName": "John",
            "lastName": "Doe",
            "email": "john.doe@gmail.com",
            "country": "US",
        },
        "age": 21,
    }
    result = rule_engine.evaluate(data, form_bundles)
    result_list_mapper_ids = []
    for mapper in result:
        result_list_mapper_ids.append(mapper.get("formProcessMapperId"))
    result_list_mapper_ids.sort()
    expected_result.sort()
    assert result_list_mapper_ids == expected_result
