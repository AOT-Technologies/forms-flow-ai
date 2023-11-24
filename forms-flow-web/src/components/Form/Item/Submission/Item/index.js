import { Redirect, Route, Switch, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSubmission, selectRoot } from "react-formio";
import View from "./View";
import Edit from "./Edit";
import { getApplicationById } from "../../../../../apiManager/services/applicationServices";
import { setApplicationDetailLoader } from "../../../../../actions/applicationActions";
import { getUserRolePermission } from "../../../../../helper/user";
import {
  BASE_ROUTE,
  CLIENT,
  CUSTOM_SUBMISSION_URL,
  CUSTOM_SUBMISSION_ENABLE,
  STAFF_REVIEWER,
} from "../../../../../constants/constants";
import { CLIENT_EDIT_STATUS } from "../../../../../constants/applicationConstants";
import Loading from "../../../../../containers/Loading";
import { clearSubmissionError } from "../../../../../actions/formActions";
import { getCustomSubmission } from "../../../../../apiManager/services/FormServices";
import { useTranslation } from "react-i18next";
import NotFound from "../../../../NotFound";

const Item = React.memo(() => {
  const { formId, submissionId } = useParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const applicationDetail = useSelector(
    (state) => state.applications.applicationDetail
  );
  const applicationId = useSelector(
    (state) =>
      state[CUSTOM_SUBMISSION_ENABLE ? "customSubmission" : "submission"]?.submission?.data?.applicationId ||
      null
  );
  const userRoles = useSelector((state) => {
    return selectRoot("user", state).roles;
  });
  const applicationStatus = useSelector(
    (state) => state.applications.applicationDetail?.applicationStatus || ""
  );
  const [showSubmissionLoading, setShowSubmissionLoading] = useState(true);
  const [editAllowed, setEditAllowed] = useState(false);
  const submissionError = useSelector((state) => state.submission?.error);

  // const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : `/`

  useEffect(() => {
    dispatch(clearSubmissionError("submission"));
    if (CUSTOM_SUBMISSION_URL && CUSTOM_SUBMISSION_ENABLE) {
      dispatch(getCustomSubmission(submissionId, formId));
    } else {
      dispatch(getSubmission("submission", submissionId, formId));
    }
  }, [submissionId, formId, dispatch]);


  useEffect(() => {
    if (applicationId) {
      dispatch(setApplicationDetailLoader(true));
      dispatch(getApplicationById(applicationId));
    }
  }, [applicationId, dispatch]);

  useEffect(() => {
    if (getUserRolePermission(userRoles, STAFF_REVIEWER)) {
      setEditAllowed(true);
    } else if (applicationStatus) {
      if (getUserRolePermission(userRoles, CLIENT)) {
        setEditAllowed(CLIENT_EDIT_STATUS.includes(applicationStatus)
          || applicationDetail.isResubmit ? true : false);
        setShowSubmissionLoading(false);
      }
    }
  }, [applicationStatus, userRoles]);

  useEffect(() => {
    if (editAllowed && applicationStatus) setShowSubmissionLoading(false);
  }, [applicationStatus, editAllowed]);

  return (
    <div>
      <ul className="nav nav-tabs">
        {/* {showViewSubmissions && getUserRolePermission(userRoles, STAFF_REVIEWER) ?
        <li className="nav-item">
          <Link className="nav-link" to={`${redirectUrl}form/${formId}/submission`}>
            <i className="fa fa-chevron-left fa-lg" />
          </Link>
        </li>:null} */}
        {/*{(path.indexOf("edit") > 0) ?
          <li className="nav-item">
            <Link className="nav-link" to={`/form/${formId}/submission/${submissionId}`}>
            <img src="/webfonts/fa_eye.svg" alt="back"/> View
            </Link>
          </li>
          :
          editAllowed ? (<li className="nav-item">
            <Link className="nav-link" to={`/form/${formId}/submission/${submissionId}/edit`}>
              <img src="/webfonts/fa_edit.svg" alt="back"/> Edit
            </Link>
          </li>) : null
        }*/}
      </ul>
      <Switch>
        {!submissionError ? (
          <Route
            exact
            path={`${BASE_ROUTE}form/:formId/submission/:submissionId`}
            component={View}
          />
        ) : <NotFound
          errorMessage={t("Bad Request")}
          errorCode={400}
        />}
        <Redirect
          exact
          from={`${BASE_ROUTE}form/:formId/submission/:submissionId/edit/:notavailable`}
          to="/404"
        />
        {showSubmissionLoading ? (
          <Route
            path={`${BASE_ROUTE}form/:formId/submission/:submissionId/edit`}
            component={Loading}
          />
        ) : null}
        {editAllowed ? (
          <Route
            path={`${BASE_ROUTE}form/:formId/submission/:submissionId/edit`}
            component={Edit}
          />
        ) : null}
        <Route
          path={`${BASE_ROUTE}form/:formId/submission/:submissionId/:notavailable`}
          component={NotFound}
        />
      </Switch>
    </div>
  );
});

export default Item;
