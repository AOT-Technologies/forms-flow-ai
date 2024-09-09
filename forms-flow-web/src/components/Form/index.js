import React from "react";
import { Route, Switch } from "react-router-dom";
import { useSelector } from "react-redux";

import List from "./List";
import Stepper from "./Stepper";
import Item from "./Item/index";
import { BASE_ROUTE } from "../../constants/constants";
import Loading from "../../containers/Loading";
import AccessDenied from "../AccessDenied";

let user = "";

const CreateFormRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      if (user.includes('create_designs') || user.includes('view_designs')) {
        return <Component {...props} />;
      } else {
        return <AccessDenied userRoles={user} />;
      }
    }}
  />
);
const FormSubmissionRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) => 
        (<Component {...props} /> )
    }
  />
);

export default React.memo(() => {
  user = useSelector((state) => state.user.roles || []);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  if (!isAuthenticated) {
    return <Loading />;
  }

  return (
    <div data-testid="Form-index">
      <Switch>
        <Route exact path={`${BASE_ROUTE}form`} component={List} />
        <CreateFormRoute
          path={`${BASE_ROUTE}formflow/:formId?/:step?`}
          component={Stepper}
        />
        <FormSubmissionRoute
          path={`${BASE_ROUTE}form/:formId/`}
          component={Item}
        />
      </Switch>
    </div>
  );
});
