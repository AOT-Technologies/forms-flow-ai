import React from 'react';
import { Trans } from "react-i18next";
import { Translation } from "react-i18next";


const NoData = React.memo(() => (
<div className="h-100 col-12 text-center div-middle">
<i className="fa fa-tachometer fa-lg"/>
<br></br>
<br></br>
<label> <Translation>{(t)=>t("no_dashboard_found")}</Translation> </label>
    </div>
))

export default NoData;
