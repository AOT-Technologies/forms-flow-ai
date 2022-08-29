import React from "react";
import "./loading.scss";

const SavingLoading = ({ saved, text }) => {
  return (
    <div className="d-flex align-items-center justify-content-end px-2">
      {saved ? (
        <i className="fa fa-check-circle-o " aria-hidden="true"></i>
      ) : (
        <i className="fa fa-spinner loading-animation" aria-hidden="true"></i>
      )}
      <span className="px-2">{text}</span>
    </div>
  );
};

export default SavingLoading;
