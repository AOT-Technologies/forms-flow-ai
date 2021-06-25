import React from "react";
import "./footer.scss";
import { APPLICATION_NAME } from "../../constants/constants";
import {version} from "../../../package.json"
const appname = APPLICATION_NAME;
const version_org = version;
const Footer = React.memo(() => {
  //const today = new Date();
  return (
    <div className="row footer">
      <div className="col-12 text-center text-align">
      Powered by<a href="https://formsflow.ai" target='_blank'  rel="noreferrer"> {appname}</a> v{version_org} {/*{today.getFullYear()}*/}
      </div>
    </div>
  );
});
export default Footer;
