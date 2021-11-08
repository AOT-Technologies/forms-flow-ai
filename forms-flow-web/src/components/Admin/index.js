import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import InsightDashboard from './Insightdashboard';
export default React.memo(() => {
  return (
    <div className="container" id="main">
      <Switch>
        <Route exact path="/admin" component={InsightDashboard} />
        <Redirect from='*' to='/404'/>
      </Switch>
    </div>
  );
});
