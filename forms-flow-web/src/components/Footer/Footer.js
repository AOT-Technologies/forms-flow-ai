import React from "react";
import "./footer.scss";
import {version} from "../../../package.json";
import {Translation} from "react-i18next";

const version_org = version;
const Footer = React.memo(() => {
  //const today = new Date();
  return (
    <div className="row footer">
      <div className="col-12 text-center text-align">
      <Translation>{(t)=>t("powered_by")}</Translation><a href="https://formsflow.ai" target='_blank'  rel="noreferrer"> formsflow.ai </a> v{version_org} {/*{today.getFullYear()}*/}
      </div>
    </div>
  );
});
export default Footer;
