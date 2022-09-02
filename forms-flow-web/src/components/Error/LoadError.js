import React from "react";
import "./loadError.scss";
import { Translation } from "react-i18next";

const LoadError = React.memo(
  ({ text = <Translation>{(t) => t("Something went wrong.")}</Translation>, className = "", noStyle = false }) => {
    if (noStyle) {
      return <div>{text}</div>;
    }
    return (
      <div className="row ">
        <div className={`col-12 error-message-block ${className} `}>
          <div className="alert alert-danger error-alert" role="alert">
            <i className="fa fa-arrow-left fa-lg" />
            <div className="alert-heading d-inline ml-3">{text}</div>
          </div>
        </div>
      </div>
    );
  }
);
export default LoadError;
