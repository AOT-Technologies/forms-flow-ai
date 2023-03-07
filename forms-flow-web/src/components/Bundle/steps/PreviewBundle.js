import { Tab, Tabs } from "@material-ui/core";
import React, { useEffect } from "react";
import { useState } from "react";
import { Form, Formio } from "react-formio";
import { fetchFormById } from "../../../apiManager/services/bpmFormServices";
import Loading from "../../../containers/Loading";
import SaveNext from "./SaveAndNext";
import { push } from "connected-react-router";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import { useDispatch, useSelector } from "react-redux";
const PreviewBundle = ({ handleNext, handleBack, activeStep, isLastStep }) => {
  const forms = [
    { id: "63fc41027e513a3995321307", formName: "hiii", type: "form" },
    { id: "63abf8f883be32f0efe87989", formName: "sad", type: "form" },
    { id: "63abf8f883be32f0efe87989", formName: "sd33", type: "form" },
    { id: "63fc41027e513a3995321307", formName: "cccccccc", type: "resource" },
  ];
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const dispatch = useDispatch();
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";


  const [tabValue, setTabValue] = useState(0);
  const [getFormLoading, setGetFormLoading] = useState(true);
  const [form,setForm] = useState({});
 
  const handleTabChange = (e, value) => {
    setTabValue(value);
  };

  const gotoEdit = () =>{
    dispatch(push(`${redirectUrl}bundleflow/63fc41027e513a3995321307/edit`));
  };

  useEffect(() => {
    setGetFormLoading(true);
    Formio.cache = {};
    fetchFormById(forms[tabValue].id).then((res)=>{
      setForm(res.data);
    }).finally(()=>{
    setGetFormLoading(false);
    });
  }, [tabValue]);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between">
        <h3>New Form</h3>
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
      <div>
        <Tabs
          value={tabValue}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleTabChange}
        >
          {forms.map((item) => (
            <Tab key={item.id} label={item.formName} />
          ))}
        </Tabs>
        <div>{getFormLoading ? <Loading /> : <Form form={form} options={{readOnly:true}}/>}</div>
      </div>
    </div>
  );
};

export default PreviewBundle;
