import { Route, Switch, Redirect, useParams } from "react-router-dom";
import React, { useEffect } from "react";
import { Formio, getForm } from "react-formio";
import { useDispatch, useSelector } from "react-redux";
import {
  STAFF_REVIEWER,
  CLIENT,
  STAFF_DESIGNER,
  BASE_ROUTE,
  MULTITENANCY_ENABLED,
} from "../../../constants/constants";
import View from "./View";
import Edit from "./Edit";
import Submission from "./Submission/index";
import Preview from "./Preview";
import { checkIsObjectId } from "../../../apiManager/services/formatterService";
import { fetchFormByAlias } from "../../../apiManager/services/bpmFormServices";
import {
  setFormFailureErrorData,
  setFormRequestData,
  setFormSuccessData,
  resetFormData,
  clearSubmissionError,
} from "../../../actions/formActions";

import Draft from "../../Draft";

const Item = React.memo(() => {
  const { formId } = useParams();
  const userRoles = useSelector((state) => state.user.roles || []);
  const tenantKey = useSelector((state) => state?.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetFormData("form", formId));
    dispatch(clearSubmissionError("submission"));
    if (checkIsObjectId(formId)) {
      dispatch(getForm("form", formId));
    } else {
      dispatch(
        fetchFormByAlias(formId, async (err, formObj) => {
          if (!err) {
            const form_id = formObj._id;
            dispatch(
              setFormRequestData(
                "form",
                form_id,
                `${Formio.getProjectUrl()}/form/${form_id}`
              )
            );
            dispatch(setFormSuccessData("form", formObj));
          } else {
            dispatch(setFormFailureErrorData("form", err));
          }
        })
      );
    }
  }, [formId, dispatch]);

  /**
   * Protected route to form submissions
   */
  const SubmissionRoute = ({ component: Component, ...rest }) => (
    <Route
      {...rest}
      render={(props) =>
        userRoles.includes(STAFF_REVIEWER) || userRoles.includes(CLIENT) ? (
          <Component {...props} />
        ) : (
          <Redirect exact to={`${redirectUrl}`} />
        )
      }
    />
  );
  /**
   * Protected route for form deletion
   */
  const FormActionRoute = ({ component: Component, ...rest }) => (
    <Route
      {...rest}
      render={(props) =>
        userRoles.includes(STAFF_DESIGNER) ? (
          <Component {...props} />
        ) : (
          <Redirect exact to={`${redirectUrl}`} />
        )
      }
    />
  );

  return (
    <div>
      <Switch>
        <Route exact path={`${BASE_ROUTE}form/:formId`} component={View} />
        <FormActionRoute
          path={`${BASE_ROUTE}form/:formId/preview`}
          component={Preview}
        />
        <FormActionRoute
          path={`${BASE_ROUTE}form/:formId/edit`}
          component={Edit}
        />
        <SubmissionRoute
          path={`${BASE_ROUTE}form/:formId/submission`}
          component={Submission}
        />
        <SubmissionRoute
          path={`${BASE_ROUTE}form/:formId/draft`}
          component={Draft}
        />
        <Redirect exact to="/404" />
      </Switch>
    </div>
  );
});

export default Item;
