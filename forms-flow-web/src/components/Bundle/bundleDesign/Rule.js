import React from 'react';
import { useState } from 'react';
import RuleCreateModal from './RuleCreateModal';
import RulesTable from './RulesTable';

const Rule = () => {
    const [createdRules, setCreatedRules] = useState([]);
    const [selectedRule, setSelectedRule] = useState(null);
    const [showRulesModal,setShowRulesModal] = useState(false);

    const handleModalChange = () =>{
        console.log("hi");
        setShowRulesModal(!showRulesModal);
    };
    const editRule = (newRule)=>{
        setCreatedRules(prev => prev.map(rule => rule.id === newRule.id ? newRule : rule));
    };
    const deleteRule = (ruleId)=>{
        setCreatedRules(prev => prev.filter(rule => rule.id === ruleId));
    };
    const addRule = (newRule)=>{
        setCreatedRules(prev => [...prev,newRule]);
    };
    const selectEditRule = (ruleId)=>{
        setSelectedRule(createdRules.find(i => i.id === ruleId));
        handleModalChange();
    };

  return (
    <div>
        <RulesTable createdRules={createdRules} selectEditRule={selectEditRule} 
         deleteRule={deleteRule} handleModalChange={handleModalChange}/>
         <RuleCreateModal editRule={editRule} selectedRule={selectedRule} addRule={addRule} 
         handleModalChange={handleModalChange} showModal={showRulesModal}/>
    </div>
  );
};

export default Rule;