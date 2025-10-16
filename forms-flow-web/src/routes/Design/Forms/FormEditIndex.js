import React, { useEffect,useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Edit as FormEdit } from './FormEdit.js';
import { setApiCallError } from "../../../actions/ErroHandling.js";
import { resetFormData, setFormAuthVerifyLoading, setFormAuthorizationDetails, setFormSuccessData } from "../../../actions/formActions.js";
import {
    getFormProcesses,
    resetFormProcessData,
    getApplicationCount
  } from "../../../apiManager/services/processServices";

import { fetchFormAuthorizationDetials } from "../../../apiManager/services/authorizationService.js";
import { Formio, getForm } from "@aot-technologies/formio-react";
import Loading from "../../../containers/Loading.js";
import NotFound from "../../../components/NotFound/index.js";
import { addHiddenApplicationComponent } from "../../../constants/applicationComponent.js";

const Index = () => {
  const { formId } = useParams();
  const dispatch = useDispatch();
  const formAuthVerifyLoading = useSelector(
    (state) => state.process?.formAuthVerifyLoading
  );
  const apiCallError = useSelector((state) => state.errors?.apiCallError);
  const [mapperDataLoading, setMapperDataLoading] = useState(false);

  // fetch form and mapper data along with authorization data
  const errorHandling = (err) => {
    const { response } = err;
    dispatch(
      setApiCallError({
        message:
          response?.data?.message || 
          response?.statusText ||
          err.message ||
          "Bad Request",
        status: response?.status || "400",
      })
    );
  };
  useEffect(() => {
    Formio.cache = {};
    dispatch(setApiCallError(null));
    dispatch(resetFormData("form", formId));
    dispatch(resetFormProcessData());
    dispatch(setFormAuthVerifyLoading(true));
    
    // If no formId, it's a new form creation
    if (!formId) {      
      // Set empty form data for new form
      const newFormData = {
        _id: null,
        title: "Untitled Form",
        name: "untitled-form",
        display: "form",
        type: "form",
        components: [],
        settings: {},
        properties: {},
        tags: [],
        access: [],
        submissionAccess: [],
        owner: null,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        machineName: "untitled-form",
        isNewForm: true
      };
      // Inject hidden components for new forms
      const newFormWithHidden = addHiddenApplicationComponent({ ...newFormData });
      // this global state is used to store the form data when initialy create the form using form-design api
      dispatch(setFormSuccessData("form", newFormWithHidden));
      
      // Set empty authorization details for new form
      dispatch(setFormAuthorizationDetails({
        application: { roles: [], userName: null, resourceDetails: { submitter: false } },
        designer: { roles: [], userName: null, resourceDetails: {} },
        reviewer: { roles: [], userName: null, resourceDetails: {} }
      }));
      
      // Set both loading states to false for new forms
      dispatch(setFormAuthVerifyLoading(false));
      return;
    }
    
    dispatch(
      getForm("form", formId, async (err, res) => {
        if (err) {
          errorHandling(err);
          dispatch(setFormAuthVerifyLoading(false));
        } else {
          try {
            //TBD:  need to combine these two calls 
            setMapperDataLoading(true);
            dispatch(getFormProcesses(res._id,(err, res)=>{
              dispatch(getApplicationCount(res.id));
              setMapperDataLoading(false);
            }));
            const authResponse = await fetchFormAuthorizationDetials(
              res?.parentFormId || res._id
            );
            dispatch(setFormAuthorizationDetails(authResponse.data));
            dispatch(setFormAuthVerifyLoading(false));
          } catch (error) {
            errorHandling(error);
          }
        }
      })
    );
  }, [formId]);

  // For new forms (no formId), use local state
  // For existing forms, check both formAuthVerifyLoading and mapperDataLoading
  
  
  if (formAuthVerifyLoading || mapperDataLoading) {
    return <Loading />;
  }
  if (apiCallError) {
    return (
      <NotFound
        errorMessage={apiCallError.message}
        errorCode={apiCallError.status}
      />
    );
  }
  return <FormEdit />;
};

export default Index;
