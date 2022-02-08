import React from 'react';
import { Translation } from "react-i18next";

const Nodata = React.memo(() => (
<div className="div-no-application-list text-center">
<i className="fa fa-clipboard fa-lg"/>
<br/>
<br/>
<label className="lbl-no-application"> <Translation>{(t)=>t("no_applications_found")}</Translation> </label>
<br/>
  {/*  <label className="lbl-no-application-desc"> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do </label>
  */}  </div>
))

export default Nodata;
