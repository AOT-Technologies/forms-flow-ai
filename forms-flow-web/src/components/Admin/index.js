import React, { useEffect } from "react";
import { Route, Switch, Redirect, withRouter } from "react-router-dom";
import InsightDashboard from "./Insightdashboard";
import { useDispatch } from "react-redux";
import {
  fetchdashboards,
  fetchGroups,
  fetchAuthorizations,
} from "../../apiManager/services/dashboardsService";
import "./insightDashboard.scss";
import { BASE_ROUTE } from "../../constants/constants";

const AdminDashboard = React.memo(() => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchdashboards());
    dispatch(fetchGroups());
    dispatch(fetchAuthorizations());
  }, [dispatch]);

  return (
    <div className="container" id="main" tabIndex="0">
      <Switch>
        <Route exact path={`${BASE_ROUTE}admin`} component={InsightDashboard} />
        <Redirect from="*" to="/404" />
      </Switch>
    </div>
  );
});

export default withRouter(AdminDashboard);
