
import React, { useEffect, useMemo } from "react";
import { Formio, getForm } from "react-formio";
import { useDispatch, useSelector } from "react-redux";
import {
  STAFF_REVIEWER,
  CLIENT,
  // MULTITENANCY_ENABLED,
} from "../../../constants/constants";
import View from "./View";
import Submission from "./Submission/index";
import { checkIsObjectId } from "../../../apiManager/services/formatterService";
import { fetchFormByAlias } from "../../../apiManager/services/bpmFormServices";
import {
  setFormRequestData,
  setFormSuccessData,
  resetFormData,
  clearSubmissionError,
  setFormAuthVerifyLoading,
} from "../../../actions/formActions";

import Draft from "../../Draft";
import Loading from "../../../containers/Loading";
import { getClientList, getReviewerList } from "../../../apiManager/services/authorizationService";
import NotFound from "../../NotFound";
import { setApiCallError } from "../../../actions/ErroHandling";
import { Routes,Route,useParams, useLocation, Navigate } from "react-router-dom-v6";

const Item = React.memo(() => {
  const { formId } = useParams();
  const location = useLocation(); // React Router's hook to get the current location
  const pathname = location.pathname;
  const userRoles = useSelector((state) => state.user.roles || []);
  //NEED TO /404 URL WITH REDIRECT URL
  // const tenantKey = useSelector((state) => state?.tenants?.tenantId);
  // const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const formAuthVerifyLoading = useSelector((state)=>state.process?.formAuthVerifyLoading);
  const apiCallError = useSelector((state)=>state.errors?.apiCallError);
  const dispatch = useDispatch();

  const formAuthVerify = (formId,successCallBack)=>{
      const isSubmissionRoute = pathname?.includes("/submission");
      const authFunction = isSubmissionRoute
      ? userRoles.includes(STAFF_REVIEWER)
        ? getReviewerList
        : getClientList
      : getClientList;
       authFunction(formId).then(successCallBack).catch((err)=>{
        const {response} = err;
        dispatch(setApiCallError({message:response?.data?.message || 
          response.statusText,status:response.status}));
      }).finally(()=>{
        dispatch(setFormAuthVerifyLoading(false));
      });
  };
  
  useEffect(() => {
    dispatch(setApiCallError(null));
    dispatch(setFormAuthVerifyLoading(true));
    dispatch(resetFormData("form", formId));
    dispatch(clearSubmissionError("submission"));
    if (checkIsObjectId(formId)) {
      dispatch(getForm("form", formId,(err,res)=>{
        if(err){
          dispatch(setFormAuthVerifyLoading(false));
        }else{    
          formAuthVerify(res.parentFormId || res._id);
        }
      }));
    } else {
      dispatch(
        fetchFormByAlias(formId, async (err, formObj) => {
          if (!err) {
       
            formAuthVerify(formObj.parentFormId || formObj._id,()=>{
              const form_id = formObj._id;
              dispatch(
                setFormRequestData(
                  "form",
                  form_id,
                  `${Formio.getProjectUrl()}/form/${form_id}`
                )
              );
              dispatch(setFormSuccessData("form", formObj));
            });
          
          } else {
            dispatch(setFormAuthVerifyLoading(false));
            const { response } = err;
            dispatch(
              setApiCallError({
                message:
                  response?.data?.message ||
                  response?.statusText ||
                  err.message,
                status: response?.status ,
              })
            );
          }
        })
      );
    }

  }, [formId, dispatch]);

  /**
   * Protected route to form submissions
   */

  if(formAuthVerifyLoading){
    return <Loading/>;
  }

  if(apiCallError && !formAuthVerifyLoading){
    return <NotFound
    errorMessage={apiCallError?.message}
    errorCode={apiCallError?.status}
  />;
  }

 

  const FormSubmissionRoute = useMemo(
    () =>
      ({ element }) =>
        userRoles.includes(STAFF_REVIEWER) || userRoles.includes(CLIENT) ? (
          element
        ) : (
          <Navigate to="/unauthorized" replace />
        ),
  
    [userRoles]
  );

  /**
   * Protected route for form deletion
   */

  return (
      <Routes>
        <Route path={``} element={<View/>} />
        <Route path={"submission/*"} element={<FormSubmissionRoute element={<Submission/>} />} />
        <Route path={"draft/*"} element={<FormSubmissionRoute element={<Draft/>} />} />
        <Route path="*" element={<Navigate to="/404" />} />
      </Routes>
  );
});

export default Item;
