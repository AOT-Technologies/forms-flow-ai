import { Route, Switch, Redirect } from "react-router-dom";
import React from "react";

// import List from './List'
import Item from "./Item/index";
import { BASE_ROUTE } from "../../../../constants/constants";
import  userRoles  from "../../../../constants/permissions";

const Form = React.memo(() => {
  const { viewSubmissions } = userRoles();
 

  return (
    <div>
      <Switch>
        <Route exact path={`${BASE_ROUTE}form/:formId/submission`}>
          <Redirect exact to="/404" />
        </Route>
        {viewSubmissions && (
          <Route
            path={`${BASE_ROUTE}form/:formId/submission/:submissionId`}
            component={Item}
          />
        )}
      </Switch>
    </div>
  );
});

export default Form;
