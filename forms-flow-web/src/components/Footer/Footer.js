import React from "react";
import "./footer.scss";

const Footer = () => {
  const today = new Date();
  return (
    <div className="row footer">
      <div className="col-12 text-center text-align">
        Copyright &copy; AOT Technologies {today.getFullYear()}
      </div>
    </div>
  );
};
export default Footer;
