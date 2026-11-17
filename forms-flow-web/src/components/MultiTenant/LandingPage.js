import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import "./landingPage.css";
import { validateTenant } from "../../apiManager/services/tenantServices";
import { useTranslation } from "react-i18next";

const LandingPage = () => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);
  const history = useHistory();
  const { t } = useTranslation();

  const handleSubmit = (event) => {
    event.preventDefault();
    validateTenant(username)
      .then((res) => {
        if (!res.data.tenantKeyExist) {
          setError(t("Tenant not found"));
        } else {
          setError(null); // Clear the error if validation is successful
          history.push(`/tenant/${username}`);
        }
      })
      .catch((err) => {
        console.error("error", err);
      });
  };

  return (
    <div className="landing">
      <div className="formContainer">
        <div className="innerContainer">
          <img
            src="https://149641023.v2.pressablecdn.com/wp-content/uploads/2022/05/Site_logo.png"
            alt="formsflow Logo"
            className="logo"
          />
          <h1 className="heading">{t("Enter your Tenant Name")}</h1>
          <form onSubmit={handleSubmit} className="formTenant">
            <div className="formGroupTenant">
              <label htmlFor="username" className="formLabelTenant">
                {t("Please provide your tenant name to sign in")}
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`form-control ${error ? "is-invalid" : ""}`}
                placeholder="Eg: johndoe"
                required
              />
              {error && <div className="invalid-feedback">{error}</div>}
            </div>
            <button
              type="submit"
              className="btn btn-primary btnTenant"
              disabled={!username}
            >
              {t("Proceed to Sign In")}
            </button>
          </form>
          {/* <div className="lineTenant"></div>
          <div className="supportText">{t("Contact formsflow.ai support")}</div>
          <div className="supportLink">
            <a href="/contact">info@formsflow.ai</a>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
