import React, { useEffect } from "react";
import { Route } from "react-router-dom";
import { connect } from "react-redux";
import { getForm } from "@aot-technologies/formio-react";
// import View from "../routes/Submit/Forms/View";
import NotFound from "./NotFound";
import UserForm from "../routes/Submit/Forms/UserForm";

const PublicRoute = ({publish}) => {

  useEffect(()=>{
    publish("FF_PUBLIC");
  },[]);

  return (
      <>
        <Route exact path="/public/form/:formId" render={(props) => <UserForm {...props} publish={publish}  />} />
        <Route path="/public/form/:formId/:notavailable" component={NotFound} />
      </>
  );
};

// eslint-disable-next-line no-unused-vars
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    getForm: (id) => dispatch(getForm("form", id)),
  };
};

export default connect(null, mapDispatchToProps)(PublicRoute);
