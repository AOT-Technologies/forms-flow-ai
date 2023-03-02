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
    const [selectedRUleIndex, setSlectedRuleIndex] = useState(null);
    const [showRulesModal,setShowRulesModal] = useState(false);

    const handleModalChange = () =>{
        // when close the modal if using submit or close button then clear the selectedRule value
        if(showRulesModal){
            setSelectedRule(null);
            setSlectedRuleIndex(null);
        }
        setShowRulesModal(!showRulesModal);
    };
    const editRule = (editedRule)=>{
        const newRules =  bundleRules.map((rule,index) => index === selectedRUleIndex ? 
        editedRule : rule);
        dispatch(setBundleRules(newRules));
        handleModalChange();
        setSelectedRule(null);
    };
    const deleteRule = (indexOfItem)=>{
        dispatch(setBundleRules(bundleRules.filter((_,index)=> index !== indexOfItem )));
    };
    const addRule = (newRule)=>{
        dispatch(setBundleRules([...bundleRules,{...newRule}]));
        handleModalChange();

    };
    const selectEditRule = (rule,index)=>{
        setSelectedRule(rule);
        setSlectedRuleIndex(index);
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