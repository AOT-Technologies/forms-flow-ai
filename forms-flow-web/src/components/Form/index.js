import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { selectRoot } from "react-formio";

import List from "./List";
// import Create from "./Create";
import Stepper from "./Stepper";
/*import Item from "./Item/index";*/
import { STAFF_DESIGNER } from "../../constants/constants";
import Loading from "../../containers/Loading";
import { setUserAuth, setCurrentPage } from "../../actions/bpmActions";

let user = "";

const CreateFormRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      user.includes(STAFF_DESIGNER) ? (
        <Component {...props} />
      ) : (
        <Redirect exact to="/" />
      )
    }
  />
);

const Form = (props) => {
  user = props.user;
  if (!props.isAuthenticated) {
    return <Loading />;
  }
  return (
    <div className="container" id="main">
      <Switch>
        <Route exact path="/form" component={List} />
        <CreateFormRoute
          exact
          path="/form/:formId?/:step?"
          component={Stepper}
        />

        {/* <Route path="/form/:formId" component={Item} /> */}
      </Switch>
    </div>
  );
};

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
