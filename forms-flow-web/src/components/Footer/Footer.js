import React from "react";
import "./footer.scss";
const Footer = React.memo(() => {
  //const today = new Date();
  return (
    <div className="row footer">
      <div className="col-12 text-center text-align">
      Powered by<a href="https://formsflow.ai" target='_blank'  rel="noreferrer"> formsflow.ai</a> {/*{today.getFullYear()}*/}
      </div>
    </div>
  );
});
export default Footer;
