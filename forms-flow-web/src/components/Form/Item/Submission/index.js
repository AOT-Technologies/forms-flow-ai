import { Route, Switch, Redirect } from "react-router-dom";
import React from "react";

// import List from './List'
import Item from "./Item/index";
import { BASE_ROUTE } from "../../../../constants/constants";

const Form = React.memo(() => {
  // const userRoles= useSelector((state) => state.user.roles || []);
  // const showViewSubmissions= useSelector((state) => state.user.showViewSubmissions);
  // const tenantKey = useSelector((state) => state.tenants?.tenantId)
  // const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : `/`
  // const ViewSubmissionRoute = ({ component: Component, ...rest }) => (
  //   <Route {...rest} render={(props) => (
  //     userRoles.includes(STAFF_REVIEWER)
  //       ? <Component {...props} />
  //       : <Redirect exact to={redirectUrl} />
  //   )} />
  // );
  return (
    <div>
      <Switch>
        {/* {showViewSubmissions?
          <ViewSubmissionRoute exact path={`${BASE_ROUTE}form/:formId/submission`} component={List} />:null}
         */}
        <Route exact path={`${BASE_ROUTE}form/:formId/submission`}>
          <Redirect exact to="/404" />
        </Route>
        <Route
          path={`${BASE_ROUTE}form/:formId/submission/:submissionId`}
          component={Item}
        />
      </Switch>
    </div>
  );
});

export default Form;
