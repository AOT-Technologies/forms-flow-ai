import React, { useEffect } from "react";
import { useState } from "react";
import { Form, Formio, Errors } from "react-formio";
import { fetchFormById } from "../../../apiManager/services/bpmFormServices";
import Loading from "../../../containers/Loading";
import SaveNext from "./SaveAndNext";
import { push } from "connected-react-router";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import { useDispatch, useSelector } from "react-redux";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
const PreviewBundle = ({ handleNext, handleBack, activeStep, isLastStep }) => {
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const dispatch = useDispatch();
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const forms = useSelector((state) => state.bundle.selectedForms || []);
  const bundleData = useSelector((state) => state.process.formProcessList);
  const [formStep, setFormStep] = useState(0);
  const [getFormLoading, setGetFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({});

  const handleNextForm = () => {
    setError("");
    setFormStep(formStep + 1);
  };

  const handleBackForm = () => {
    setError("");
    setFormStep(formStep - 1);
  };

  const gotoEdit = () => {
    dispatch(push(`${redirectUrl}bundleflow/${bundleData.formId}/edit`));
  };

  useEffect(() => {
    Formio.cache = {};
    if (forms?.length) {
      setGetFormLoading(true);
      setForm({});
      fetchFormById(forms[formStep].formId)
        .then((res) => {
          setForm(res.data);
        })
        .catch((err) => {
          if (err) {
            let error;
            if (err.response?.data) {
              error = err.response.data;
            } else {
              error = err.message;
            }

            setError(error);
          }
        })
        .finally(() => {
          setGetFormLoading(false);
        });
    }
  }, [formStep]);

  return (
    <div>
      <div className="d-flex align-items-center flex-wrap justify-content-between my-4 bg-light p-3">
        <h3>
          <i className="fa fa-folder-o mr-2" aria-hidden="true"></i>
          {bundleData.formName}
        </h3>
        <div>
          <button
            className="btn btn-primary mr-2"
            onClick={() => {
              gotoEdit();
            }}
          >
            <i className="fa fa-pencil" aria-hidden="true" />
            &nbsp;&nbsp; Edit Bundle
          </button>
          <SaveNext
            handleNext={handleNext}
            handleBack={handleBack}
            activeStep={activeStep}
            isLastStep={isLastStep}
          />
        </div>
      </div>

      {forms.length ? (
        <div className="border py-2">
          <Stepper activeStep={formStep} nonLinear>
            {forms?.map((form) => (
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
                  <Form form={form} options={{ readOnly: true, viewAsHtml: true }} />
                </div>
                {
                  forms.length > 1 ? (
                    <div className="d-flex align-items-center justify-content-end px-3 py-2">
                    <button
                      onClick={handleBackForm}
                      disabled={formStep == 0}
                      className="btn btn-secondary mr-2"
                    >
                      Previous Form
                    </button>
                    <button
                      onClick={handleNextForm}
                      disabled={forms.length - 1 === formStep}
                      className="btn btn-primary"
                    >
                      Next Form
                    </button>
                  </div>
                  ) : ""
                }
              </div>
            )}
          </div>
        </div>
      ) : (
        <h3 className="text-center">No Forms Selected</h3>
      )}
    </div>
  );
};

export default PreviewBundle;
