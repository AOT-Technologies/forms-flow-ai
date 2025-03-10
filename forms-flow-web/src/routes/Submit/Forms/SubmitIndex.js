import { Route, Switch, Redirect, useParams, useLocation } from "react-router-dom";
import React, { useEffect } from "react";
import { Formio, getForm } from "@aot-technologies/formio-react";
import { useDispatch, useSelector } from "react-redux";
import {
  BASE_ROUTE,
  MULTITENANCY_ENABLED,
} from "../../../constants/constants";
import  userRoles  from "../../../constants/permissions";
// import View from "./View";
import Submission from "../Submission";
import { checkIsObjectId } from "../../../apiManager/services/formatterService";
import { fetchFormByAlias } from "../../../apiManager/services/bpmFormServices";
import {
  setFormRequestData,
  setFormSuccessData,
  resetFormData,
  clearSubmissionError,
  setFormAuthVerifyLoading,
} from "../../../actions/formActions";

import Draft from "../../../components/Draft";
import Loading from "../../../containers/Loading";
import { getClientList, getReviewerList } from "../../../apiManager/services/authorizationService";
import NotFound from "../../../components/NotFound";
import { setApiCallError } from "../../../actions/ErroHandling";
import proptypes from 'prop-types';
import UserForm from "./UserForm";

const SubmissionRoute = ({ component: Component, createSubmissions, 
  viewSubmissions, redirectUrl, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      createSubmissions || viewSubmissions ? (
        <Component {...props} />
      ) : (
        <Redirect exact to={`${redirectUrl}`} />
      )
    }
  />
);

SubmissionRoute.propTypes = {
  component: proptypes.func.isRequired,
  createSubmissions: proptypes.bool.isRequired,
  viewSubmissions: proptypes.bool.isRequired,
  redirectUrl: proptypes.string.isRequired,
};

const Item = React.memo(() => {
  const { formId } = useParams();
  const location = useLocation(); // React Router's hook to get the current location
  const pathname = location.pathname;
    const tenantKey = useSelector((state) => state?.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const formAuthVerifyLoading = useSelector((state)=>state.process?.formAuthVerifyLoading);
  const apiCallError = useSelector((state)=>state.errors?.apiCallError);
  const dispatch = useDispatch();
  const { createSubmissions, viewSubmissions} = userRoles();


  const formAuthVerify = ({parentFormId, currentFormId},successCallBack)=>{
      const isSubmissionRoute = pathname?.includes("/submission");
      const authFunction = (isSubmissionRoute && viewSubmissions) ? getReviewerList : getClientList;
       authFunction({parentFormId, currentFormId}).then(successCallBack).catch((err)=>{
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
    Formio.cache = {}; //clearing formio cache
    dispatch(clearSubmissionError("submission"));
    if (checkIsObjectId(formId)) {
      dispatch(getForm("form", formId,(err,res)=>{
        if(err){
          dispatch(setFormAuthVerifyLoading(false));
        }else{    
          formAuthVerify({parentFormId:res.parentFormId || res._id, currentFormId: res._id});
        }
      }));
    } else {
      dispatch(
        fetchFormByAlias(formId, async (err, formObj) => {
          if (!err) {
       
            formAuthVerify({parentFormId:formObj.parentFormId || formObj._id, 
              currentFormId:formObj._id},()=>{
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

  return (
    <div>
      <Switch>
        <Route exact path={`${BASE_ROUTE}form/:formId`} component={UserForm} />
        <SubmissionRoute
          path={`${BASE_ROUTE}form/:formId/submission`}
          component={Submission}
          createSubmissions={createSubmissions}
          viewSubmissions={viewSubmissions}
          redirectUrl={redirectUrl}
        />
        <SubmissionRoute
          path={`${BASE_ROUTE}form/:formId/draft`}
          component={Draft}
          createSubmissions={createSubmissions}
          viewSubmissions={viewSubmissions}
          redirectUrl={redirectUrl}
        />
        <Redirect exact to="/404" />
      </Switch>
    </div>
  );
});

export default Item;
