import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import {useSelector} from "react-redux";

import List from "./List";
import Stepper from "./Stepper";
import Item from "./Item/index";
import { STAFF_DESIGNER, STAFF_REVIEWER, CLIENT } from "../../constants/constants";
import Loading from "../../containers/Loading";

let user = "";

const CreateFormRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      if(user.includes(STAFF_DESIGNER)){
        return <Component {...props} />;
      } else{
        return <Redirect exact to="/" />
      }
    }
    }
  />
);
const FormSubmissionRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    user.includes(STAFF_REVIEWER) || user.includes(CLIENT)
      ? <Component {...props} />
      : <Redirect exact to='/' />
  )} />
);


export default React.memo(() => {
  user = useSelector(state=>state.user.roles || []);
  const isAuthenticated = useSelector(state=>state.user.isAuthenticated);
  if (!isAuthenticated) {
    return <Loading />;
  }
  return (
    <div className="container" id="main" data-testid="Form-index">
      <Switch>
        <Route exact path="/form" component={List} />
        <CreateFormRoute
          path="/formflow/:formId?/:step?"
          component={Stepper}
        />
        <FormSubmissionRoute path="/form/:formId/" component={Item}/>
      </Switch>
    </div>
  );
});
