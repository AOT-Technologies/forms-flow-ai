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
import useInterval from "../../../customHooks/useInterval";
import { getDraftReqFormat } from "../../../apiManager/services/bpmServices";
import {
  DRAFT_ENABLED,
  DRAFT_POLLING_RATE,
} from "../../../constants/constants";
import { toast } from "react-toastify";
import { isEqual } from "lodash";
import { useParams } from "react-router-dom";
import SavingLoading from "../../Loading/SavingLoading";
import {
  draftCreate,
  draftUpdate,
  publicDraftCreate,
  publicDraftUpdate,
} from "../../../apiManager/services/draftService";
const BundleSubmit = ({ readOnly, onSubmit }) => {
  const dispatch = useDispatch();
  const { bundleId } = useParams();
  const options = readOnly ? { readOnly: true, viewAsHtml: true } : {};
  const bundleData = useSelector((state) => state.process.formProcessList);
  const selectedForms = useSelector((state) => state.bundle.selectedForms);
  const { error } = useSelector((state) => state.form);
  const [validationErrorIndex, setValidationErroIndex] = useState(null);

  const [formStep, setFormStep] = useState({ step: 0 });
  const [getFormLoading, setGetFormLoading] = useState(false);
  const [form, setForm] = useState({});
  const bundleSubmission = useSelector(
    (state) => state.bundle.bundleSubmission
  );
  const [submission, setSubmission] = useState(null);
  const bundleSubmitLoading = useSelector(
    (state) => state.bundle.bundleSubmitLoading
  );
  const formRef = useRef();
  const [formCache, setFormCache] = useState({});
  const draftSubmissionId = useSelector(
    (state) => state.draft.draftSubmission?.id
  );
  // Holds the latest data saved by the server
  const lastUpdatedDraft = useSelector((state) => state.draft.lastUpdated);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const [isDraftCreated, setIsDraftCreated] = useState(false);
  const exitType = useRef("UNMOUNT");
  const [draftSaved, setDraftSaved] = useState(false);
  const [notified, setNotified] = useState(false);
  const draftCreateMethod = isAuthenticated ? draftCreate : publicDraftCreate;
  const draftUpdateMethod = isAuthenticated ? draftUpdate : publicDraftUpdate;
  const [poll, setPoll] = useState(DRAFT_ENABLED);
  const [isValidResource, setIsValidResource] = useState(false);

  let formValidationNotOver = true;

  useEffect(() => {
    getForm();
  }, [formStep]);

  useEffect(() => {
    setTimeout(() => {
      setNotified(true);
    }, 5000);
  }, []);

  useEffect(() => {
    if (isDraftCreated) {
      setDraftSaved(true);
    }
  }, [isDraftCreated]);

  useEffect(() => {
    if (bundleId && !error) setIsValidResource(true);
    return () => setIsValidResource(false);
  }, [error, form._id]);
  /**
   * Will create a draft application when the form is selected for entry.
   */
  useEffect(() => {
    if (
      DRAFT_ENABLED &&
      isValidResource &&
      isAuthenticated &&
      bundleData.status === "active"
    ) {
      let payload = getDraftReqFormat(bundleId, submission?.data);
      dispatch(draftCreateMethod(payload, setIsDraftCreated));
    }
  }, [bundleId, isValidResource]);

  /**
   * Compares the current form data and last saved data
   * Draft is updated only if the form is updated from the last saved form data.
   */
  const saveDraft = (payload, exitType = exitType) => {
    if (exitType === "SUBMIT") return;
    let dataChanged = !isEqual(payload.data, lastUpdatedDraft.data);
    if (draftSubmissionId && isDraftCreated) {
      if (dataChanged) {
        setDraftSaved(false);
        dispatch(
          draftUpdateMethod(payload, draftSubmissionId, (err) => {
            if (exitType === "UNMOUNT" && !err && isAuthenticated) {
              toast.success("Submission saved to draft.");
            }
            if (!err) {
              setDraftSaved(true);
            } else {
              setDraftSaved(false);
            }
          })
        );
      }
      //show success toaster - no datachange, but still draft is createdgit
      else {
        toast.success("Submission saved to draft.");
      }
    }
  };
  /**
   * We will repeatedly update the current state to draft table
   * on purticular interval
   */
  useInterval(
    () => {
      let payload = getDraftReqFormat(bundleId, { ...submission?.data });
      saveDraft(payload);
    },
    poll ? DRAFT_POLLING_RATE : null
  );

  /**
   * Save the current state when the component unmounts.
   * Save the data before submission to handle submission failure.
   */
  useEffect(() => {
    return () => {
      let payload = getDraftReqFormat(bundleId, submission?.data);
      if (poll) saveDraft(payload, exitType.current);
    };
  }, [bundleId, draftSubmissionId, isDraftCreated, poll, exitType.current]);

  const getForm = (done = () => {}) => {
    if (selectedForms?.length) {
      dispatch(clearFormError("form"));
      setGetFormLoading(true);
      fetchFormById(selectedForms[formStep.step].formId)
        .then((res) => {
          if (!readOnly) {
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

  const checkFormStepChange = (responseData) => {
    let changed = null;
    if (responseData) {
      responseData.forEach((i, index) => {
        if (changed === null && selectedForms[index]?.formId !== i.formId) {
          changed = index;
        }
      });
    }
    return changed;
  };

  const handleNextForm = () => {
    if (readOnly) {
      setFormStep({ step: formStep.step + 1 });
      return;
    }

    handleSubmisionData();
    if (formRef.current.formio.checkValidity()) {
      dispatch(setBundleSubmitLoading(true));
      if (validationErrorIndex !== null) {
        setValidationErroIndex(null);
      }
      executeRule({ data: submission.data }, bundleData.id)
        .then((res) => {
          let changed = null;
          if (res.data.length !== selectedForms.length) {
            changed = checkFormStepChange(res.data);
            if (changed == null) {
              changed = formStep.step;
            }
          }
          dispatch(setBundleSelectedForms(res.data));

          setFormStep({ step: changed !== null ? changed : formStep.step + 1 });
        })
        .finally(() => {
          dispatch(setBundleSubmitLoading(false));
        });
    }
  };

  const handleBackForm = () => {
    setFormStep({ step: formStep.step - 1 });
  };

  const bundleFormValidation = async (valid, index) => {
    if (!valid && formValidationNotOver) {
      formValidationNotOver = valid;
      setValidationErroIndex(index);
      setFormStep({ step: index });
      dispatch(setBundleSubmitLoading(false));
      return;
    }
    if (valid && index === selectedForms.length - 1 && formValidationNotOver) {
      formValidationNotOver = false;
      const response = await executeRule(
        { data: submission.data },
        bundleData.id
      );
      if (response && response.data.length !== selectedForms.length) {
        const changed = checkFormStepChange(response.data);
        dispatch(setBundleSelectedForms(response.data));
        setFormStep({ step: changed });
        dispatch(setBundleSubmitLoading(false));
        return;
      }
      setPoll(false);
      exitType.current = "SUBMIT";
      onSubmit({ data: submission.data }, bundleData.formId);
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

  if (!form.title && getFormLoading) {
    return <Loading />;
  }

  return (
    <div className="p-3">
      <>
        <span className="pr-2  mr-2 d-flex justify-content-end align-items-center">
          {!notified && (
            <span className="text-primary">
              <i className="fa fa-info-circle mr-2" aria-hidden="true"></i>
              {"Unfinished applications will be saved to Applications/Drafts."}
            </span>
          )}

          {notified && poll && (
            <SavingLoading
              text={draftSaved ? "Saved to Applications/Drafts" : "Saving..."}
              saved={draftSaved}
            />
          )}
        </span>
      </>
      <div>
        <LoadingOverlay
          active={bundleSubmitLoading || getFormLoading}
          spinner
          text={"Loading..."}
        >
          <div className="border py-2">
            <Stepper activeStep={formStep.step} alternativeLabel>
              {selectedForms?.map((form, index) => (
                <Step key={form.id}>
                  <StepLabel error={validationErrorIndex === index}>
                    {form.formName}
                  </StepLabel>
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
                    options={{
                      hide: { submit: true },
                      ...options,
                      highlightErrors: true,
                    }}
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
                  {readOnly && selectedForms.length - 1 == formStep.step ? (
                    ""
                  ) : (
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
                  )}
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
