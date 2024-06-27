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
import userRoles from "../../constants/permissions";

const DesignerProcessRoute = ({ component: Component, hasAccess, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      if (hasAccess) {
        return <Component {...props} />;
      } else {
        return <>Unauthorized</>;
      }
    }}
  />
);

const Processes = () => {
  const isAuthenticated = useSelector((state) => state.user?.isAuthenticated);
  const { createDesigns } = userRoles();

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
          hasAccess={createDesigns}
        />
        <DesignerProcessRoute
          exact
          path={`${BASE_ROUTE}processes/:processId`}
          component={Base}
          hasAccess={createDesigns}
        />
        <DesignerProcessRoute
          exact
          path={`${BASE_ROUTE}processes/:type/:processId/edit`}
          component={Edit}
          hasAccess={createDesigns}
        />
        <Redirect exact to="/404" />
      </Switch>
    </div>
  );
};

export default React.memo(Processes);
