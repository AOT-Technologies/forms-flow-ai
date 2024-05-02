import React, { useEffect } from "react";
import {Route, Routes } from "react-router-dom";
import { connect } from "react-redux";
import { getForm } from "react-formio";
import View from "../components/Form/Item/View";
import NotFound from "./NotFound";

const PublicRoute = ({ publish }) => {
  useEffect(() => {
    publish("FF_PUBLIC");
  }, []);

  return (
    <div className="container py-2 min-hightcontainer">
      <Routes>
        <Route path="public/form/:formId" element={<View publish={publish} />} />
        <Route path="public/form/:formId/*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    getForm: (id) => dispatch(getForm("form", id)),
  };
};

export default connect(null, mapDispatchToProps)(PublicRoute);