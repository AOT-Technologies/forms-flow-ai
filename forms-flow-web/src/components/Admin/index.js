import React, { useEffect } from "react";
import { Route, Switch, Redirect, withRouter } from "react-router-dom";
import InsightDashboard from "./Insightdashboard";
import { useDispatch } from "react-redux";
import {
  fetchdashboards,
  fetchGroups,
} from "../../apiManager/services/dashboardsService";
import ACTION_CONSTANTS from "../../actions/actionConstants";
import "./insightDashboard.scss";
import { BASE_ROUTE } from "../../constants/constants";

const AdminDashboard = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchdashboards());
    dispatch(fetchGroups());

    return () =>
      dispatch({
        type: ACTION_CONSTANTS.DASHBOARDS_CLEAN_UP,
        payload: null,
      });
  }, [dispatch]);

  return (
    <div className="container" id="main" tabIndex="0">
      <Switch>
        <Route exact path={`${BASE_ROUTE}admin`} component={InsightDashboard} />
        <Redirect from="*" to="/404" />
      </Switch>
    </div>
  );
};

export default withRouter(AdminDashboard);
