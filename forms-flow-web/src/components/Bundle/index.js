import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";

import Stepper from "./Stepper";

import {
  STAFF_DESIGNER,
  BASE_ROUTE,
} from "../../constants/constants";
import Loading from "../../containers/Loading";

let user = "";

const DesignerBundleRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      if (user.includes(STAFF_DESIGNER)) {
        return <Component {...props} />;
      } else {
        return <Redirect exact to="/" />;
      }
    }}
  />
);
 

export default React.memo(() => {
  user = useSelector((state) => state.user.roles || []);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  if (!isAuthenticated) {
    return <Loading />;
  }
  return (
    <div className="container" id="main" data-testid="Form-index">
      <Switch>
        <DesignerBundleRoute
          path={`${BASE_ROUTE}bundleflow/:formId?/:step?`}
          component={Stepper}
        />
      </Switch>
    </div>
  );
});
