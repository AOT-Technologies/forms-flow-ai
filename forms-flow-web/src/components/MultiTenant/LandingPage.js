import React, { useState } from "react";
import "./landingPage.css";
import { validateTenant } from "../../apiManager/services/tenantServices";

const LandingPage = () => {
  const [username, setUsername] = useState("");

  const handleSubmit = () => {
    console.log("clicking");
    validateTenant(username);
  };

  return (
    <div className="landing">
      <div className="imageContainer">
        <img src="https://i0.wp.com/formsflow.ai/wp-content/uploads/2021/08/srvc-bnr.png?fit=702%2C569&ssl=1" alt="Login Image" className="image" />
      </div>
      <div className="formContainer">
        <div className="innerContainer">
          <img src="https://149641023.v2.pressablecdn.com/wp-content/uploads/2022/05/Site_logo.png" alt="formsflow Logo" className="logo" />
          <h1 className="heading">Enter your Tenant Name</h1>
          <div className="formControls">
            <label htmlFor="username" className="label">Please provide your teanant name to sign in</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="Eg: johndoe"
            />
          </div>
          <div className="formControls">
            <button
              className={username ? "button" : "buttonDisabled"}
              onClick={handleSubmit}
              disabled={!username}
            >
              Proceed to Sign In
            </button>

          </div>
          <div className="line"></div>
          <div className="supportText">
            Contact formsflow.ai support
          </div>
          <div className="supportLink">
            <a href="/contact">info@formsflow.ai</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;