import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFormById } from "../../../apiManager/services/bpmFormServices";
import Loading from "../../../containers/Loading";
import { Form, Errors } from "react-formio";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
 import { Formio } from "formiojs";
 import {
  setBundleSelectedForms,
  setBundleSubmissionData,
  setBundleSubmitLoading,
} from "../../../actions/bundleActions";
 import LoadingOverlay from "react-loading-overlay";
 import {
  clearFormError,
  setFormFailureErrorData, 
} from "../../../actions/formActions";
import { executeRule } from "../../../apiManager/services/bundleServices";
const BundleSubmit = ({readOnly, onSubmit}) => {
  const dispatch = useDispatch();
  const options = readOnly ? { readOnly: true, viewAsHtml: true } : {};
  const bundleData = useSelector((state) => state.process.formProcessList);
  const selectedForms = useSelector((state) => state.bundle.selectedForms);
   const { error } = useSelector((state) => state.form);
  const [validationErrorIndex , setValidationErroIndex] = useState(null);

  const [formStep, setFormStep] = useState({step:0});
  const [getFormLoading, setGetFormLoading] = useState(false);
  const [form, setForm] = useState({}); 
  const bundleSubmission = useSelector(
    (state) => state.bundle.bundleSubmission
  );
  const [submission, setSubmission] = useState(null); 
  const bundleSubmitLoading = useSelector((state)=> state.bundle.bundleSubmitLoading);
  const formRef = useRef();
  const [formCache, setFormCache] = useState({});
  let formValidationNotOver = true;

  useEffect(() => {
    getForm();
  }, [formStep]);

  const getForm = (done = ()=>{}) => {
    if (selectedForms?.length) {
      dispatch(clearFormError("form"));
      setGetFormLoading(true);
      fetchFormById(selectedForms[formStep.step].formId)
        .then((res) => {
         if(!readOnly){
            !formCache[res.data._id] &&
            setFormCache({ ...formCache, [res.data._id]: res.data });
         }
          setForm(res.data);
        })
        .catch((err) => {
          dispatch(
            setFormFailureErrorData("form", err.response?.data || err.message)
          );
        })
        .finally(() => {
          setGetFormLoading(false);
          done();
        });
        
    }
  };

  const handleSubmisionData = () => {
    dispatch(
      setBundleSubmissionData({
        data: { ...bundleSubmission.data, ...submission.data },
      })
    );
  };

  const checkFormStepChange = (responseData)=>{
    let changed = null;
    if (responseData) {
      responseData.forEach((i,index)=> { 
        if(changed === null && selectedForms[index]?.formId !== i.formId){
          changed = index;
        }
      });
    }
    return changed;
  };

  const handleNextForm = () => {
    if(readOnly){
        setFormStep({step: formStep.step + 1});
        return ;
    }

    handleSubmisionData();
    if (formRef.current.formio.checkValidity()) {
      dispatch(setBundleSubmitLoading(true));
      if(validationErrorIndex !== null){
        setValidationErroIndex(null);
      }
      executeRule({ data: submission.data }, bundleData.id)
        .then((res) => {
          let changed = null;
          if(  res.data.length - 1 !== formStep.step){
             changed = checkFormStepChange(res.data); 
          }
          dispatch(setBundleSelectedForms(res.data));
          setFormStep({step: changed ? changed : formStep.step + 1});
         
        })
        .finally(() => {
            dispatch(setBundleSubmitLoading(false));
        });
    }
  };

  const handleBackForm = () => {
    setFormStep({step:formStep.step - 1});
  };

  const bundleFormValidation = async (valid, index) => {
    if (!valid && formValidationNotOver) {
      formValidationNotOver = valid;
      setValidationErroIndex(index);
      setFormStep({step:index});
      dispatch(setBundleSubmitLoading(false));
      return;
    }
    if (valid && index === selectedForms.length - 1 && formValidationNotOver) {
      formValidationNotOver = false;
      const response = await executeRule(
        { data: submission.data },
        bundleData.id
      );
      if (response && response.data.length - 1 !== formStep.step) {
        const changed = checkFormStepChange(response.data); 
        dispatch(setBundleSelectedForms(response.data));
        setFormStep({step:changed});
        dispatch(setBundleSubmitLoading(false));
        return;
      }
      onSubmit(bundleSubmission, bundleData.formId);
    }
  };

  const handleSubmit = async () => {
    handleSubmisionData();
    if (formRef.current.formio.checkValidity()) {
        dispatch(setBundleSubmitLoading(true));
      selectedForms.forEach(async (form, index) => {
        const formioForm = await Formio.createForm(formCache[form.formId]);
        formioForm.submission = { data: submission.data };
        formioForm.on("change", function (changed) {
          const { isValid } = changed;
          formioForm.setPristine(false);
          formioForm.checkValidity();
          formioForm.redraw();
          bundleFormValidation(isValid, index);
        });
      });
    }
  };



if(!form.title && getFormLoading){
    return  <Loading />;
}

  return (
    <div className="p-3">
        <div>
        <LoadingOverlay
              active={bundleSubmitLoading || getFormLoading}
              spinner
              text={"Loading..."}
            >
              <div className="border py-2">
                <Stepper activeStep={formStep.step} alternativeLabel>
                  {selectedForms?.map((form,index) => (
                    <Step key={form.id}>
                      <StepLabel error={validationErrorIndex === index}>{form.formName}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
                <div className="px-3">
                    <div>
                      <Errors errors={error} />
                      <h3 className="px-3 py-2">{form.title}</h3>
                      <div className="px-3 py-2">
                        <Form
                          form={form}
                          options={{ hide: { submit: true },...options}}
                          ref={formRef}
                          submission={bundleSubmission}
                          onChange={(e) => {
                            setSubmission(e);
                          }}
                        />
                      </div>

                      <div className="d-flex align-items-center justify-content-end px-3 py-2">
                        {formStep.step === 0 ? (
                          ""
                        ) : (
                          <button
                            onClick={handleBackForm}
                            className="btn btn-secondary mr-2"
                          >
                            Previous Form
                          </button>
                        )}
                       {
                        readOnly && selectedForms.length - 1 == formStep.step ? "" : (
                            <button
                            onClick={
                              selectedForms.length - 1 === formStep.step
                                ? handleSubmit
                                : handleNextForm
                            }
                            disabled={bundleSubmitLoading}
                            className="btn btn-primary"
                          >
                            {selectedForms.length - 1 === formStep.step
                              ? "Submit Form"
                              : "Next Form"}
                          </button>
                        )  
                       }
                      </div>
                    </div>
                </div>
              </div>
            </LoadingOverlay>
        </div>
    
    </div>
  );
};

export default BundleSubmit;
