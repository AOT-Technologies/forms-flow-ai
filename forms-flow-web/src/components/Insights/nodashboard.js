import React from 'react';
import { Translation } from "react-i18next";


const NoData = React.memo(() => (
<div className="h-100 col-12 text-center div-middle">
<i className="fa fa-tachometer fa-lg"/>
<br></br>
<br></br>
<label> <Translation>{(t)=>t("No dashboard found")}</Translation> </label>
    </div>
))

export default NoData;
