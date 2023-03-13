import { Tab, Tabs } from "@material-ui/core";
import React, { useEffect } from "react";
import { useState } from "react";
import { Form, Formio, Errors} from "react-formio";
import { fetchFormById } from "../../../apiManager/services/bpmFormServices";
import Loading from "../../../containers/Loading";
import SaveNext from "./SaveAndNext";
import { push } from "connected-react-router";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import { useDispatch, useSelector } from "react-redux";
const PreviewBundle = ({ handleNext, handleBack, activeStep, isLastStep }) => {

  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const dispatch = useDispatch();
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const forms = useSelector((state)=> state.bundle.selectedForms);
  const bundleData = useSelector(state => state.process.formProcessList);
  const [tabValue, setTabValue] = useState(0);
  const [getFormLoading, setGetFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [form,setForm] = useState({});
 
  const handleTabChange = (e, value) => {
    setError('');
    setTabValue(value);
  };

 

  const gotoEdit = () =>{
    dispatch(push(`${redirectUrl}bundleflow/${bundleData.formId}/edit`));
  };

  useEffect(() => {
    Formio.cache = {};
    if(forms.length){
      setGetFormLoading(true);
      setForm({});
      fetchFormById(forms[tabValue].formId).then((res)=>{
        setForm(res.data);
      }).catch((err)=>{
        if(err){
          let error;
          if (err.response?.data) {
            error = err.response.data;
          } else {
            error = err.message;
          }
  
          setError(error);
        }
      }).finally(()=>{
        setGetFormLoading(false);
      });
    }
  
  }, [tabValue]);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between">
        <h3>{bundleData.formName}</h3>
        <div>
        <button
            className="btn btn-primary"
            onClick={() => {
              gotoEdit();
            }}
          >
            <i className="fa fa-pencil" aria-hidden="true" />
            &nbsp;&nbsp; Edit Form
          </button>
          <SaveNext
            handleNext={handleNext}
            handleBack={handleBack}
            activeStep={activeStep}
            isLastStep={isLastStep}
          />
        </div>
      </div>
      <Errors errors={error} />
      <div>
        <Tabs
          value={tabValue}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleTabChange}
        >
          {forms.map((item) => (
            <Tab key={item.formId} label={item.formName} />
          ))}
        </Tabs>
        <div>{getFormLoading ? <Loading /> : <Form form={form} options={{readOnly:true}}/>}</div>
      </div>
    </div>
  );
};

export default PreviewBundle;
