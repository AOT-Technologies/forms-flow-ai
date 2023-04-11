import { Redirect, Route, Switch, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetSubmission, selectRoot } from "react-formio";
import View from "./View";
import Edit from "./Edit";
import { getApplicationById } from "../../../../apiManager/services/applicationServices";
import { setApplicationDetailLoader } from "../../../../actions/applicationActions";
import NotFound from "../../../NotFound";
import { getUserRolePermission } from "../../../../helper/user";
import {
  BASE_ROUTE,
  CLIENT,
  CUSTOM_SUBMISSION_URL,
  CUSTOM_SUBMISSION_ENABLE,
  STAFF_REVIEWER,
} from "../../../../constants/constants";
import { CLIENT_EDIT_STATUS } from "../../../../constants/applicationConstants";
import Loading from "../../../../containers/Loading";
import {
  clearFormError,
  clearSubmissionError,
} from "../../../../actions/formActions";
import {
  formioGetSubmission,
  getCustomSubmission,
} from "../../../../apiManager/services/FormServices";
import {
  resetBundleData,
  setBundleSubmissionData,
} from "../../../../actions/bundleActions";

const Item = React.memo(() => {
  const { bundleId, submissionId } = useParams();
  const dispatch = useDispatch();
  // const showViewSubmissions= useSelector((state) => state.user.showViewSubmissions);
  //const path = props.location.pathname;
  const applicationId = useSelector(
    (state) =>
      selectRoot("submission", state)?.submission?.data?.applicationId || null
  );
  const userRoles = useSelector((state) => {
    return selectRoot("user", state).roles;
  });
  const applicationStatus = useSelector(
    (state) => state.applications.applicationDetail?.applicationStatus || ""
  );
  const [showSubmissionLoading, setShowSubmissionLoading] = useState(false);
  const [editAllowed, setEditAllowed] = useState(false);

  useEffect(() => {
    dispatch(clearSubmissionError("submission"));
    dispatch(resetSubmission("submission"));
    dispatch(clearFormError("form"));
    dispatch(resetBundleData());
    if (CUSTOM_SUBMISSION_URL && CUSTOM_SUBMISSION_ENABLE) {
      dispatch(getCustomSubmission(submissionId, bundleId));
    } else {
      formioGetSubmission(bundleId, submissionId).then((res) => {
        dispatch(setBundleSubmissionData({ data: res.data.data }));
      });
    }
  }, [submissionId, bundleId, dispatch]);

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
        setEditAllowed(CLIENT_EDIT_STATUS.includes(applicationStatus));
        setShowSubmissionLoading(false);
      }
    }
  }, [applicationStatus, userRoles]);

  useEffect(() => {
    if (editAllowed && applicationStatus) setShowSubmissionLoading(false);
  }, [applicationStatus, editAllowed]);

  return (
    <div>
      <Switch>
        <Route
          exact
          path={`${BASE_ROUTE}bundle/:bundleId/submission/:submissionId`}
          component={View}
        />
        <Redirect
          exact
          from={`${BASE_ROUTE}bundle/:bundleId/submission/:submissionId/edit/:notavailable`}
          to="/404"
        />
        {showSubmissionLoading ? (
          <Route
            path={`${BASE_ROUTE}bundle/:bundleId/submission/:submissionId/edit`}
            component={Loading}
          />
        ) : null}
        {editAllowed ? (
          <Route
            path={`${BASE_ROUTE}bundle/:bundleId/submission/:submissionId/edit`}
            component={Edit}
          />
        ) : null}
        <Route
          path={`${BASE_ROUTE}bundle/:bundleId/submission/:submissionId/:notavailable`}
          component={NotFound}
        />
      </Switch>
    </div>
  );
});

export default Item;
