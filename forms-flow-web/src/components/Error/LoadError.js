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
        <img src="/webfonts/fa_times_circle.svg" alt="back"/>
          <div className="alert-heading d-inline ml-3">{text}</div>
        </div>
      </div>
    </div>
  );
});
export default LoadError;
