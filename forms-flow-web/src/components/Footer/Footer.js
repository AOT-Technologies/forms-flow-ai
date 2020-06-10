import React from "react";

const Footer = () => {
  const today = new Date();
  return (
    <div className="row ">
      <div className="col-12 text-center">
        Copyright &copy; AOT Technologies {today.getFullYear()}
      </div>
    </div>
  );
};
export default Footer;
