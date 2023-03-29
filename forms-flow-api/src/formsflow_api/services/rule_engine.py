"""Module for performing all rule related operations with form bundling."""
from typing import Dict, List, Set

from flask import current_app
from rule_engine import Rule
from rule_engine.errors import (
    EvaluationError,
    RuleSyntaxError,
    SymbolResolutionError,
)

from formsflow_api.models import FormBundling, FormProcessMapper
from formsflow_api.schemas import FormBundleDetailSchema
from formsflow_api.schemas.form_bundling import SelectedFormSchema

bundle_schema = SelectedFormSchema()
form_detail_schema = FormBundleDetailSchema()


class RuleEngine:  # pylint:disable=too-few-public-methods
    """Class for performing all rule related operations with form bundling."""

    @staticmethod
    def evaluate(
        submission_data: Dict[str, any], mapper_id: int, skip_rules: bool = False
    ) -> List[FormProcessMapper]:
        """Evaluate the data against list of conditions and return list of satisfied conditions."""
        current_app.logger.debug(
            "Evaluating rules for Mapper : %s, skip Rules : %s", mapper_id, skip_rules
        )
        form_bundles = FormBundling.find_by_form_process_mapper_id(mapper_id)
        parent_form_ids: Set[str] = []
        for form_bundle in form_bundles:
            try:
                # Iterate rule and check if ANY condition matches. Only supporting OR condition now for MVP.
                is_rule_passed = (
                    True
                    if (skip_rules or len(form_bundle.rules) == 0)
                    else any(
                        RuleEngine._rule(form_rule).matches(submission_data.get("data"))
                        for form_rule in form_bundle.rules
                    )
                )
            except (SymbolResolutionError, RuleSyntaxError, EvaluationError) as e:
                # All of these are validation errors either with syntax or other reasons.
                # Catch it and return as if the validation is failed.
                is_rule_passed = False
                current_app.logger.info("Error on rule evaluation")
                current_app.logger.info(e)
            current_app.logger.debug(
                "Finished executing the rule {{ %s }} --> Form bundle ID : %s",
                form_bundle.rules,
                form_bundle.id,
            )
            if is_rule_passed:
                parent_form_ids.append(form_bundle.parent_form_id)

        # 1. get all form process mappers for the passed rule forms
        # 2. Find matching parentFormId from the bundle with the one from mapper
        # 3. Merge the dict, so that the result will have values from bundle and mapper together
        form_mappers = FormProcessMapper.find_forms_by_parent_from_ids(parent_form_ids)
        form_mappers_list = form_detail_schema.dump(form_mappers, many=True)

        form_bundles_list = bundle_schema.dump(form_bundles, many=True)
        # Merge the dictionary if parentFormId matches on both.
        merged_list = [
            {
                **mapper,
                **next(
                    (
                        bundle
                        for bundle in form_bundles_list
                        if bundle["parentFormId"] == mapper["parentFormId"]
                    ),
                    {},
                ),
            }
            for mapper in form_mappers_list
        ]
        # Sort list by form order & fill missing form order.
        merged_list = sorted(merged_list, key=lambda d: d["formOrder"])
        for index, value in enumerate(merged_list, start=1):
            value["formOrder"] = index

        return merged_list

    @staticmethod
    def _rule(rule: str) -> Rule:
        return Rule(rule)
