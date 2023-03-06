"""Module for performing all rule related operations with form bundling."""
from typing import Dict, List

from rule_engine import Rule  # pylint:disable=import-error
from rule_engine.errors import (  # pylint:disable=import-error
    EvaluationError,
    RuleSyntaxError,
    SymbolResolutionError,
)


class RuleEngine:  # pylint:disable=too-few-public-methods
    """Class for performing all rule related operations with form bundling."""

    def evaluate(
        self, data: Dict[str, any], form_bundles: List[Dict[str, any]]
    ) -> List[str]:
        """Evaluate the data against list of conditions and return list of satisfied conditions."""
        passed_rules: List[str] = []
        for form_bundle in form_bundles:
            try:
                # Iterate rule and check if ANY condition matches. Only supporting OR condition now for MVP.
                is_rule_passed = any(
                    self._rule(form_rule).matches(data)
                    for form_rule in form_bundle.get("rules")
                )
            except (  # pylint:disable=unused-variable # noqa: F841
                SymbolResolutionError,
                RuleSyntaxError,
                EvaluationError,
            ) as e:
                # All of these are validation errors either with syntax or other reasons.
                # Catch it and return as if the validation is failed.
                is_rule_passed = False

            if is_rule_passed:
                passed_rules.append(form_bundle)
        return passed_rules

    @staticmethod
    def _rule(rule: str) -> Rule:
        return Rule(rule)
