import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";

import Base from "./Main";
import Edit from "./Edit";
import CreateWorkflow from "./Create";
import {
  BASE_ROUTE,
} from "../../constants/constants";
import Loading from "../../containers/Loading";
import AccessDenied from "../AccessDenied";

let user = "";


const DesignerProcessRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      if (user.includes('create_designs')) {
        return <Component {...props} />;
      } else {
        return <AccessDenied userRoles={user} />;
      }
    }}
  />
);

const Processes = () => {
  user = useSelector((state) => state.user?.roles || []);
  const isAuthenticated = useSelector((state) => state.user?.isAuthenticated);

  if (!isAuthenticated) {
    return <Loading />;
  }

  return (
    <div data-testid="Process-index">
      <Switch>
        <Route exact path={`${BASE_ROUTE}processes`} component={Base} />
        <DesignerProcessRoute
          exact
          path={`${BASE_ROUTE}processes/create`}
          component={CreateWorkflow}
        />
        <DesignerProcessRoute
          exact
          path={`${BASE_ROUTE}processes/:processId`}
          component={Base}
        />
        <DesignerProcessRoute
          exact
          path={`${BASE_ROUTE}processes/:type/:processId/edit`}
          component={Edit}
        />
        <Redirect exact to="/404" />
      </Switch>
    </div>
  );
};

export default React.memo(Processes);
