import React,{useEffect, useState} from 'react';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import { Link ,useHistory,useParams} from 'react-router-dom';
import {BUNDLE_CREATE_ROUTE, STEPPER_ROUTE} from "./constant/stepperConstant";
const steps = ["Design Bundle", "Workflow", "Preview and Confirm"];
import BundleCreate from "./BundleCreate";
import BundleEdit from './steps/BundleEdit';
import BundlePreview from "./steps/PreviewBundle";
import WorkflowAssociate from "./steps/WorkflowAssociate";
const StepperComponent = () => {
    const params = useParams();
    const history = useHistory();
    const [mode,setMode] = useState("preview");
    const [isLastStep, setIsLastStep] = useState(false);

    const [activeStep,setActiveStep] = useState(0);
    const handleNext = ()=>{
       let newStep =   activeStep !== steps.length - 1 ? activeStep + 1 : activeStep;
       if(newStep === steps.length - 1 ){
        setIsLastStep(true);
       }
      setActiveStep(newStep);
    };
    const handleBack = ()=>{
        setActiveStep(activeStep - 1);
        if(activeStep === steps.length - 1){
          setIsLastStep(false);
        }

       
     };
    useEffect(()=>{
      if((params.formId !== BUNDLE_CREATE_ROUTE && !STEPPER_ROUTE.includes(params.step)) || 
      (params.formId == BUNDLE_CREATE_ROUTE && STEPPER_ROUTE.includes(params.step))){
        history.push("/form");
      } 
        if(params.formId === BUNDLE_CREATE_ROUTE && params.step === undefined){
          setMode("create");
        } 
        if(params.formId !== BUNDLE_CREATE_ROUTE && STEPPER_ROUTE.includes(params.step)){
          if(params.step === STEPPER_ROUTE[2]){
            setActiveStep(2);
          }else{
            setMode(params.step);
          }
        } 
       

    },[params]);

    const getBundleMode = (props)=>{
      switch (mode){
        case BUNDLE_CREATE_ROUTE:
          return <BundleCreate {...props}/>;
        case STEPPER_ROUTE[0]:
            return <BundleEdit {...props}/>;
        case STEPPER_ROUTE[1]:
            return <BundlePreview {...props}/>;
      }

    };

    const getStep = ()=>{
      switch (activeStep){
        case 0:
          return getBundleMode({handleNext,handleBack,isLastStep,activeStep});
        case 1:
          return <WorkflowAssociate/>;
      }
    };
  return (
    <div className='p-3'>
       <Link
              to={`/form`}
              title={"Back to Form List"}
            >
              <i className="fa fa-chevron-left fa-lg " />
      </Link>
    
      <Stepper activeStep={activeStep} nonLinear alternativeLabel >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {
        getStep()
      }
          
    </div>
  );
};

export default StepperComponent;