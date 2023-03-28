import React, { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchFormById } from "../../../apiManager/services/bpmFormServices";
import Loading from "../../../containers/Loading";
import { Form, Formio, Errors } from "react-formio";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import { getFormProcesses } from "../../../apiManager/services/processServices";
import { getBundle } from "../../../apiManager/services/bundleServices";
import { toast } from "react-toastify";
import { setBundleSubmissionData } from "../../../actions/bundleActions";
import { formioPostSubmission } from "../../../apiManager/services/FormServices";
import LoadingOverlay from "react-loading-overlay";
import { push } from "connected-react-router";
const BundleSubmit = () => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const dispatch = useDispatch();
  const bundleData = useSelector((state) => state.process.formProcessList);
  const [formStep, setFormStep] = useState(0);
  const [getFormLoading, setGetFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedForms, setSelectedForms] = useState([]);
  const bundleSubmission = useSelector(
    (state) => state.bundle.bundleSubmission
  );
  const [submission, setSubmission] = useState(null);
  const [bundleSubmitLoading, setBundleSubmitLoading] = useState(false);
  const { bundleId } = useParams();
  const formRef = useRef();
  const handleFormSubmission = () => {
    dispatch(
      setBundleSubmissionData({
        data: { ...bundleSubmission.data, ...submission.data },
      })
    );
  };

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      dispatch(
        getFormProcesses(bundleId, (err, data) => {
          if (err) {
            toast.error(err);
            setLoading(false);
          } else {
            if (data.status === "active") {
              getBundle(data.id)
                .then((res) => {
                  setSelectedForms(res.data);
                })
                .catch((err) => {
                  console.error(err);
                })
                .finally(() => {
                  setLoading(false);
                });
            } else {
              setLoading(false);
            }
          }
        })
      );
    }
  }, [isAuthenticated]);

  const handleNextForm = () => {
    setError("");
    handleFormSubmission();
    if (formRef.current.formio.checkValidity()) {
      setFormStep(formStep + 1);
    }
  };

  const handleBackForm = () => {
    setError("");
    setFormStep(formStep - 1);
  };

  const handleSubmit = () => {
    handleFormSubmission();
    setBundleSubmitLoading(true);
    if (formRef.current.formio.checkValidity()) {
      formioPostSubmission(bundleSubmission, bundleData.formId, true)
        .then(() => {
          toast.success("Submission Saved.");
          dispatch(push(`${redirectUrl}bundle`));
        }).catch((err)=>{
          setError(err.response?.data || err.message);
        })
        .finally(() => {
          setBundleSubmitLoading(false);
        });
    }

  };
  useEffect(() => {
    Formio.cache = {};
    if (selectedForms?.length) {
      setGetFormLoading(true);
      setForm({});
      fetchFormById(selectedForms[formStep].formId)
        .then((res) => {
          setForm(res.data);
        })
        .catch((err) => {
          if (err) {
            setError(err.response?.data || err.message);
          }
        })
        .finally(() => {
          setGetFormLoading(false);
        });
    }
  }, [formStep, selectedForms]);

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

      {bundleData?.status === "active" ? (
        <div>
          <Errors errors={error} />
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
