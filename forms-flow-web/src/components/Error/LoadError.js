import React from "react";
import "./loadError.scss";

const LoadError = React.memo(({
  text = "Something went wrong.",
  className = "",
  noStyle = false,
}) => {
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
});
export default LoadError;
