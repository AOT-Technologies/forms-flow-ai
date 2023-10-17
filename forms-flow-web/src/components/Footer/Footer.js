import React from "react";
import "./footer.scss";
import { version } from "../../../package.json";
import { Translation } from "react-i18next";

const version_org = version;
const Footer = React.memo(() => {
  return (
    <div>
      <hr />
      <div className="d-flex justify-content-end pb-2">
        <div className="font-weight-bold">
          <Translation>{(t) => t("Powered by ")}</Translation>{" "}
          <a className="text-link" href="https://formsflow.ai/">
            formflow.ai
          </a>
          {` v${version_org}`}
        </div>
      </div>
    </div>
  );
});
export default Footer;
