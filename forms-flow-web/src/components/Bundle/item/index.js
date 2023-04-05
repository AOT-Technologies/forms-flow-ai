import React  from "react"; 
import { Route, Switch, Redirect } from "react-router-dom";
import BundleSubmit from "./BundleSubmit"; 
import {
  BASE_ROUTE, CLIENT, MULTITENANCY_ENABLED, STAFF_REVIEWER,
} from "../../../constants/constants"; 
import {useSelector } from "react-redux";
 
const Item = React.memo(() => { 
  
  const userRoles = useSelector((state) => state.user.roles || []);
  const tenantKey = useSelector((state) => state?.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";



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

  return (
    <div>
      <Switch>
        <SubmissionRoute exact path={`${BASE_ROUTE}bundle/:bundleId`} component={BundleSubmit} />
        <Redirect exact to="/404" />
      </Switch>
    </div>
  );
});

export default Item;
