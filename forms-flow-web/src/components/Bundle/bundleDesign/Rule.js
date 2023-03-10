import React from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBundleSelectedForms } from "../../../actions/bundleActions";
import RuleCreateModal from "./RuleCreateModal";
import RulesTable from "./RulesTable";

const Rule = () => {
  const dispatch = useDispatch();
  const bundleSelectedForms = useSelector(
    (state) => state.bundle?.selectedForms || []
  );
  const [selectedEditRule, setSelectedEditRule] = useState(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const handleModalChange = () => {
    // when close the modal if using submit or close button then clear the selectedRule value
    if (showRulesModal) {
      setSelectedEditRule(null);
    }
    setShowRulesModal(!showRulesModal);
  };
  const saveRule = (newRule, parentFormId) => {
    dispatch(
      setBundleSelectedForms(
        bundleSelectedForms.map((i) => {
          if (
            selectedEditRule &&
            selectedEditRule.parentFormId !== parentFormId &&
            i.parentFormId === selectedEditRule.parentFormId
          ) {
            return { ...i, rules: [], action: null };
          } else if (parentFormId === i.parentFormId) {
            return { ...i, ...newRule };
          } else {
            return i;
          }
        })
      )
    );
    handleModalChange();
  };
  const deleteRule = (parentFormId) => {
    dispatch(
      setBundleSelectedForms(
        bundleSelectedForms.map((i) =>
          i.parentFormId === parentFormId ? { ...i, rules: [], action: null } : i
        )
      )
    );
  };

  const selectRuleForEdit = (rule) => {
    setSelectedEditRule(rule);
    handleModalChange();
  };

  return (
    <div>
      <RulesTable
        selectedForms={bundleSelectedForms}
        selectRuleForEdit={selectRuleForEdit}
        deleteRule={deleteRule}
        handleModalChange={handleModalChange}
      />
      <RuleCreateModal
        saveRule={saveRule}
        existingRule={selectedEditRule}
        handleModalChange={handleModalChange}
        showModal={showRulesModal}
      />
    </div>
  );
};

export default Rule;
