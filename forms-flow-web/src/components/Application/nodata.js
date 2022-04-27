import React from 'react';
import { Translation } from "react-i18next";

const Nodata = React.memo(() => (
<div className="div-no-application-list text-center">
<i className="fa fa-clipboard fa-lg"/>
<br/>
<br/>
<label className="lbl-no-application"> <Translation>{(t)=>t("No applications found")}</Translation> </label>
<br/>
</div>
))

export default Nodata;
