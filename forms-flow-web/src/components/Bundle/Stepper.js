import React, { useEffect, useState } from "react";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import { Link, useHistory, useParams } from "react-router-dom";
import { BUNDLE_CREATE_ROUTE, STEPPER_ROUTE } from "./constant/stepperConstant";
import {
  fetchAllBpmProcesses,
  getFormProcesses,
  resetFormProcessData,
} from "../../apiManager/services/processServices";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
const steps = ["Design Bundle", "Workflow", "Preview and Confirm"];
import BundleCreateAndEdit from "./bundleDesign/BundleCreateAndEdit";
import BundlePreview from "./steps/PreviewBundle";
import WorkflowAssociate from "./steps/WorkflowAssociate";
import { withStyles } from "@material-ui/styles";
import PreviewAndConfirm from "./steps/PreviewAndConfirm";
import { useDispatch, useSelector } from "react-redux";
import { getBundle } from "../../apiManager/services/bundleServices";
import Loading from "../../containers/Loading";
import { resetBundleData, setBundleSelectedForms } from "../../actions/bundleActions";
import { toast } from "react-toastify";
const CustomStepperLabel = withStyles(() => ({
  label: {
    fontSize: "1rem",
  },
}))(StepLabel);
const StepperComponent = () => {
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
   const tenantIdIn = MULTITENANCY_ENABLED ? tenantKey : null;
  const dispatch = useDispatch();
  const params = useParams();
  const history = useHistory();
  const [activeMode, setActiveMode] = useState("");
  const [initialMode, setInitialMode] = useState("");
  const [isLastStep, setIsLastStep] = useState(false);
  const [loading, setLoading] = useState(true); 
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    let newStep = activeStep !== steps.length - 1 ? activeStep + 1 : activeStep;
    if (newStep === steps.length - 1) {
      setIsLastStep(true);
    }
    setActiveStep(newStep);
  };
  const handleBack = () => {
    setActiveStep(activeStep - 1);
    if (activeStep === steps.length - 1) {
      setIsLastStep(false);
    }
  };

  const getMode = (params) => {
    if (params.formId === BUNDLE_CREATE_ROUTE && params.step === undefined) {
      return "create";
    }
    if (
      params.formId !== BUNDLE_CREATE_ROUTE &&
      STEPPER_ROUTE.includes(params.step)
    ) {
      return params.step;
    }
  };

  const getBundleData = (bundleId) => {
    dispatch(
      getFormProcesses(bundleId, (err,mapperData) => {
        if (err) {
          toast.error(err);
          setLoading(false);
        }else{
          getBundle(mapperData.id).then((res)=>{
            dispatch(setBundleSelectedForms(res.data.selectedForms));
          }).catch((err)=>{
            console.error(err);
          }).finally(()=>{
            setLoading(false);
          });
        }
    })
    );
  };

  useEffect(() => {
    if (
      (params.formId !== BUNDLE_CREATE_ROUTE &&
        !STEPPER_ROUTE.includes(params.step)) ||
      (params.formId == BUNDLE_CREATE_ROUTE &&
        STEPPER_ROUTE.includes(params.step))
    ) {
      history.push("/form");
    } else {
      setActiveMode(getMode(params));
    }
  }, [params,]);

  useEffect(() => {
    dispatch(resetBundleData()); 
    setInitialMode(getMode(params));
    dispatch(resetFormProcessData());
    dispatch(fetchAllBpmProcesses(tenantIdIn));
    if (STEPPER_ROUTE.includes(params.step)) {
      getBundleData(params.formId);
    }else{
      setLoading(false);
    }
  }, []);

  const getBundleMode = (props) => {
    switch (activeMode) {
      case BUNDLE_CREATE_ROUTE:
        return <BundleCreateAndEdit {...props}  />;
      case "edit":
        return <BundleCreateAndEdit {...props} mode={activeMode} />;
      case "view-edit":
        return <BundlePreview {...props} />;
    }
  };

  const getStep = (props) => {
    switch (activeStep) {
      case 0:
        return getBundleMode(props);
      case 1:
        return <WorkflowAssociate {...props} />;
      case 2:
        return <PreviewAndConfirm {...props} />;
    }
  };

  if (loading) {
    return <Loading />;
  }
  return (
    <div className="p-3">
      <Link to={`/form`} title={"Back to Form List"}>
        <i className="fa fa-chevron-left fa-lg " />
      </Link>

      <Stepper activeStep={activeStep} nonLinear alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <CustomStepperLabel>{label}</CustomStepperLabel>
          </Step>
        ))}
      </Stepper>

      {getStep({ handleNext, handleBack, isLastStep, activeStep, initialMode })}
    </div>
  );
};

export default StepperComponent;
