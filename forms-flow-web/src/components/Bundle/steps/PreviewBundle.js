import { Tab, Tabs } from '@material-ui/core';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { Form, getForm, Formio} from 'react-formio';

import { useDispatch, useSelector } from 'react-redux';
import Loading from '../../../containers/Loading';
import SaveNext from '../SaveAndNext';
const PreviewBundle = ({
    handleNext,
    handleBack,
    activeStep,
    isLastStep,
}) => {
  const forms = [
    { id: "63f366cc3f7b8b8abb0ee6d3", formName: "hiii", type: "form" },
    { id: "63ef20cfcfc4bacac50e1b24", formName: "sad", type: "form" },
    { id: "63b3b711941f11594406e271", formName: "sd33", type: "form" },
    { id: "63dcaca52f1b3dc6a48b96b7", formName: "cccccccc", type: "resource" },
   
  ];

  const [tabValue, setTabValue] = useState(0);
  const [getFormLoading, setGetFormLoading] = useState(true);
  const dispatch = useDispatch();
  const {form} = useSelector(state => state.form);
  const handleTabChange = (e,value)=>{
    setTabValue(value);
  };

  useEffect(()=>{
    setGetFormLoading(true);
    Formio.cache = {};
    dispatch(getForm("form", forms[tabValue].id,()=>{
      setGetFormLoading(false);
    }));
  },[tabValue]);

  return (
    <div>
        <div className="d-flex align-items-center justify-content-between">
            <h3>New Form</h3>
            <div>
            <SaveNext
            handleNext={handleNext}
            handleBack={handleBack}
            activeStep={activeStep}
            isLastStep={isLastStep}
            />
            </div>
        </div>
        <div>
        <Tabs
        value={tabValue}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleTabChange} 
      >
        {
          forms.map((item)=> <Tab key={item.id} label={item.formName}/>)
        }

      </Tabs>
      <div >
        {
          getFormLoading ? <Loading/> : (
            <Form form={form}/>
          )
        }
        </div>
       
        </div>
      
    </div>
  );
};

export default PreviewBundle;