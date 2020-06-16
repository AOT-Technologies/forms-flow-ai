import React from "react";
import "./nodata.scss";

const Nodata = ({ text = "No data found", className }) => {
  return (
    <div className="row ">
      <div className={`col-12 no-data ${className}`}>{text}</div>
    </div>
  );
};
export default Nodata;
