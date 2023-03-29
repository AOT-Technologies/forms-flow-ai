import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchFormById } from "../../../apiManager/services/bpmFormServices";
import Loading from "../../../containers/Loading";
import { Form,  Errors } from "react-formio";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import { Formio } from 'formiojs';
import { toast } from "react-toastify";
import { setBundleSelectedForms, setBundleSubmissionData } from "../../../actions/bundleActions";
import { formioPostSubmission } from "../../../apiManager/services/FormServices";
import LoadingOverlay from "react-loading-overlay";
import { push } from "connected-react-router";
import {
  clearFormError,
  setFormFailureErrorData,
  setFormSubmissionError,
} from "../../../actions/formActions";
import SubmissionError from "../../../containers/SubmissionError";
import { executeRule } from "../../../apiManager/services/bundleServices";
const BundleSubmit = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const bundleData = useSelector((state) => state.process.formProcessList);
  const selectedForms = useSelector((state) => state.bundle.selectedForms);
  const loading = useSelector((state) => state.bundle.bundleLoading);
  const { error } = useSelector((state) => state.form);
  const formSubmissionError = useSelector(
    (state) => state.formDelete.formSubmissionError
  );
  const [formStep, setFormStep] = useState(0);
  const [getFormLoading, setGetFormLoading] = useState(false);
  const [form, setForm] = useState({});
  const bundleSubmission = useSelector(
    (state) => state.bundle.bundleSubmission
  );
  const [submission, setSubmission] = useState(null);
  const [bundleSubmitLoading, setBundleSubmitLoading] = useState(false);
  const formRef = useRef();
  const [formCach, setFormCach] = useState({});


useEffect(() => {
  getForm();
}, [formStep]);

useEffect(() => {
  // get fist form in initial stage
  if (!submission && selectedForms.length) {
    getForm();
  }
}, [selectedForms]);


const getForm = () => {
    if (selectedForms?.length) {
      Formio.cache = {};
      dispatch(clearFormError("form"));
      setGetFormLoading(true);
      fetchFormById(selectedForms[formStep].formId)
        .then((res) => {
         !formCach[res.data._id] && setFormCach({ ...formCach, [res.data._id]: res.data });
         setForm(res.data);
        })
        .catch((err) => {
          dispatch(
            setFormFailureErrorData("form", err.response?.data || err.message)
          );
        })
        .finally(() => {
          setGetFormLoading(false);
        });
    }
  };



 const handleSubmisionData = () =>{
  dispatch(
    setBundleSubmissionData({
      data: { ...bundleSubmission.data, ...submission.data },
    })
  );
 };


  const handleNextForm = () => { 
    handleSubmisionData();
    if (formRef.current.formio.checkValidity()) {
    setBundleSubmitLoading(true);
      executeRule(submission.data,bundleData.id).then((res)=>{
        dispatch(setBundleSelectedForms(res.data));
        setFormStep(formStep + 1);
      }).finally(()=>{
          setBundleSubmitLoading(false);
      });
    }
  };

  const handleBackForm = () => {
    setFormStep(formStep - 1);
  };

  const handleSubmit = () => { 
    handleSubmisionData(); 
    if (formRef.current.formio.checkValidity()) {
      setBundleSubmitLoading(true);
      executeRule(submission.data, bundleData.id).then(()=>{
        formioPostSubmission(bundleSubmission, bundleData.formId, true)
        .then(() => {
          toast.success("Submission Saved.");
          dispatch(push(`${redirectUrl}bundle`));
        })
        .catch(() => {
          const ErrorDetails = {
            modalOpen: true,
            message: "Submission cannot be done.",
          };
          toast.error("Submission cannot be done.");
          dispatch(setFormSubmissionError(ErrorDetails));
        })
        .finally(() => {
          setBundleSubmitLoading(false);
        });
      });
      
    } 
  };

  const onConfirmSubmissionError = () => {
    const ErrorDetails = {
      modalOpen: false,
      message: "",
    };
    dispatch(setFormSubmissionError(ErrorDetails));
  };

  if (loading) {
    return (
      <div data-testid="loading-view-component">
        <Loading />
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="d-flex align-items-center">
        {isAuthenticated ? (
          <Link title="go back" to={`${redirectUrl}bundle`}>
            <i className="fa fa-chevron-left fa-lg" />
          </Link>
        ) : null}

        <h3 className="ml-3">
          <span className="">
            <i className="fa fa-folder-o" aria-hidden="true"></i> Bundle/
          </span>
          {bundleData.formName}
        </h3>
      </div>
      <hr />
      <SubmissionError
        modalOpen={formSubmissionError.modalOpen}
        message={formSubmissionError.message}
        onConfirm={onConfirmSubmissionError}
      ></SubmissionError>

      {bundleData?.status === "active" ? (
        <div>
          {!selectedForms.length ? <Errors errors={error} /> : ""}
          {selectedForms.length ? (
            <LoadingOverlay
              active={bundleSubmitLoading}
              spinner
              text={"Loading..."}
            >
              <div className="border py-2">
                <Stepper activeStep={formStep} nonLinear>
                  {selectedForms?.map((form) => (
                    <Step key={form.id}>
                      <StepLabel>{form.formName}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
                <div className="px-3">
                  {getFormLoading ? (
                    <Loading />
                  ) : (
                    <div>
                      <Errors errors={error} />
                      <h3 className="px-3 py-2">{form.title}</h3>
                      <div className="px-3 py-2">
                        <Form
                          form={form}
                          options={{ hide: { submit: true } }}
                          ref={formRef}
                          submission={bundleSubmission}
                          onChange={(e) => {
                            setSubmission(e);
                          }}
                        />
                      </div>

                      <div className="d-flex align-items-center justify-content-end px-3 py-2">
                        {formStep === 0 ? (
                          ""
                        ) : (
                          <button
                            onClick={handleBackForm}
                            className="btn btn-secondary mr-2"
                          >
                            Previous Form
                          </button>
                        )}
                        <button
                          onClick={
                            selectedForms.length - 1 === formStep
                              ? handleSubmit
                              : handleNextForm
                          }
                          disabled={bundleSubmitLoading}
                          className="btn btn-primary"
                        >
                          {selectedForms.length - 1 === formStep
                            ? "Submit Form"
                            : "Next Form"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </LoadingOverlay>
          ) : (
            <h3 className="text-center">No Forms Selected</h3>
          )}
        </div>
      ) : (
        <div
          className="container"
          style={{
            maxWidth: "900px",
            margin: "auto",
            height: "50vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h3>{"Bundle not published"}</h3>
          <p>{"You can't submit this bundle until it is published"}</p>
        </div>
      )}
    </div>
  );
};

export default BundleSubmit;
