import React from "react";
import { Route } from "react-router-dom";
import { connect } from "react-redux";
import { getForm } from "react-formio";
import View from "../components/Form/Item/View";
import NotFound from "./NotFound";

const PublicRoute = ({publish}) => {
  return (
    <div className="container">
      <Route exact path="/public/form/:formId" render={(props) => <View {...props} publish={publish}  />} />
      <Route path="/public/form/:formId/:notavailable" component={NotFound} />
    </div>
  );
};

// eslint-disable-next-line no-unused-vars
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    getForm: (id) => dispatch(getForm("form", id)),
  };
};

export default connect(null, mapDispatchToProps)(PublicRoute);
