import React from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setBundleRules } from '../../../actions/bundleActions';
import RuleCreateModal from './RuleCreateModal';
import RulesTable from './RulesTable';

const Rule = () => {
    const dispatch = useDispatch();
    const bundleRules = useSelector((state)=> state.bundle?.rules || []);
    const [selectedRule, setSelectedRule] = useState(null);
    const [showRulesModal,setShowRulesModal] = useState(false);

    const handleModalChange = () =>{
        setShowRulesModal(!showRulesModal);
    };
    const editRule = (editedRule)=>{
        const newRules =  bundleRules.map(rule => rule.id === editedRule.id ? editedRule : rule);
        dispatch(setBundleRules(newRules));
        handleModalChange();
        setSelectedRule(null);
    };
    const deleteRule = (ruleId)=>{
        dispatch(setBundleRules(bundleRules.filter(rule => rule.id !== ruleId)));
    };
    const addRule = (newRule)=>{
        dispatch(setBundleRules([...bundleRules,{id:Date.now(),...newRule}]));
        handleModalChange();

    };
    const selectEditRule = (rule)=>{
        setSelectedRule(rule);
        handleModalChange();
    };

  return (
    <div>
        <RulesTable bundleRules={bundleRules} selectEditRule={selectEditRule} 
         deleteRule={deleteRule} handleModalChange={handleModalChange}/>
         <RuleCreateModal editRule={editRule} existingRule={selectedRule} addRule={addRule} 
         handleModalChange={handleModalChange} showModal={showRulesModal}/>
    </div>
  );
};

export default Rule;