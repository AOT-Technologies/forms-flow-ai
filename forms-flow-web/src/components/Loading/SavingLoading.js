import React from 'react';
import "./loading.scss";

const SavingLoading = ({saved, text}) => {
  return (
    <div className="d-flex align-items-center justify-content-end w-100 px-5">
    <div className={`circle-loader ${saved ? "load-complete" : ""}`}>
      <div
        className="checkmark draw"
        style={{ display: `${saved ? "block" : "none"}` }}
      ></div>
    </div>
    <span>{text}</span>
  </div>
  );
};

export default SavingLoading;