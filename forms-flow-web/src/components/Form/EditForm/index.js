import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import FormEdit from "./FormEdit.js";
import { setApiCallError } from "../../../actions/ErroHandling.js";
import { resetFormData, setFormAuthVerifyLoading, setFormAuthorizationDetails } from "../../../actions/formActions.js";
import {
    getFormProcesses,
    resetFormProcessData,
  } from "../../../apiManager/services/processServices";

import { fetchFormAuthorizationDetials } from "../../../apiManager/services/authorizationService.js";
import { Formio, getForm } from "@aot-technologies/formio-react";
import Loading from "../../../containers/Loading.js";
import NotFound from "../../NotFound/index.js";

const Index = () => {
  const { formId } = useParams();
  const dispatch = useDispatch();
  const formAuthVerifyLoading = useSelector(
    (state) => state.process?.formAuthVerifyLoading
  );
  const apiCallError = useSelector((state) => state.errors?.apiCallError);
  

  // fetch form and mapper data along with authorization data
  const errorHandling = (err) => {
    const { response } = err;
    dispatch(
      setApiCallError({
        message:
          response?.data?.message ||
          "Bad Request" ||
          response?.statusText ||
          err.message,
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
    dispatch(
      getForm("form", formId, async (err, res) => {
        if (err) {
          errorHandling(err);
          dispatch(setFormAuthVerifyLoading(false));
        } else {
          try {
            //TODO:  need to combine these two calls 
            dispatch(getFormProcesses(res._id));
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

  if (formAuthVerifyLoading) {
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
