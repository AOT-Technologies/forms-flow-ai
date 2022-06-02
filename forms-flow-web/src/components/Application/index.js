import React, { useEffect } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ApplicationList from "./List";
import ViewApplication from "./ViewApplication";
import "./Application.scss";
import { setCurrentPage } from "../../actions/bpmActions";
import { BASE_ROUTE } from "../../constants/constants";

export default React.memo(() => {
  const showApplications = useSelector((state) => state.user.showApplications);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setCurrentPage("application"));
  }, [dispatch]);

  return (
    <div className="container" id="main">
      <Switch>
        {showApplications ? (
          <>
            <Route
              exact
              path={`${BASE_ROUTE}application`}
              component={ApplicationList}
            />
            <Route path={`${BASE_ROUTE}application/:applicationId`}>
              <ViewApplication />
            </Route>
            <Route
              path={`${BASE_ROUTE}application/:applicationId/:notavailable`}
            >
              <Redirect exact to="/404" />
            </Route>
          </>
        ) : null}
      </Switch>
    </div>
  );
});
