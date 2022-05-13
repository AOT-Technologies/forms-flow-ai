import React from "react";
import "./nodata.scss";
import {Translation} from 'react-i18next';

const Nodata = React.memo(({ text = <Translation>{(t)=>t("No data found")}</Translation>, className }) => {
  return (
    <div className="row ">
      <div className={`col-12 no-data ${className}`}>{text}</div>
    </div>
  );
});
export default Nodata;
