import React from "react";
import { Translation } from "react-i18next";

const Nodata = React.memo((props) => (
  <div className="div-no-application-list text-center">
    <i className="fa fa-clipboard fa-lg" />
    <br />
    <br />
    <label className="lbl-no-application">
      <Translation>{(t) => t(props.text)}</Translation>
    </label>
    <br />
  </div>
));

export default Nodata;
