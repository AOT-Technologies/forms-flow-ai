import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { selectRoot } from "react-formio";

import List from "./List";
// import Create from "./Create";
import Stepper from "./Stepper";
import Item from "./Item/index";
import { STAFF_DESIGNER, STAFF_REVIEWER, CLIENT } from "../../constants/constants";
import Loading from "../../containers/Loading";
import { setUserAuth, setCurrentPage } from "../../actions/bpmActions";

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


const Form = React.memo((props) => {
  user = props.user;
  if (!props.isAuthenticated) {
    return <Loading />;
  }
  return (
    <div className="container" id="main">
      <Switch>
        <Route exact path="/form" component={List} />
        <CreateFormRoute
          path="/formflow/:formId?/:step?"
          component={Stepper}
        />
        <FormSubmissionRoute path="/form/:formId/" component={Item}/>
        {/* <Route path="/form/:formId" component={Item} /> */}
      </Switch>
    </div>
  );
});

const mapStatetoProps = (state) => {
  return {
    user: selectRoot("user", state).roles || [],
    isAuthenticated: state.user.isAuthenticated,
  };
};

const mapStateToDispatch = (dispatch) => {
  return {
    setCurrentPage: dispatch(setCurrentPage("form")),
    setUserAuth: (value) => {
      dispatch(setUserAuth(value));
    },
  };
};

export default connect(mapStatetoProps, mapStateToDispatch)(Form);
