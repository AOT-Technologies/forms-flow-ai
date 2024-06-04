import React from "react";
import { kcServiceInstance } from "../PrivateRoute"; // Import the kcServiceInstance function
import { ReactComponent as AccessDeniedIcon } from "./AccessDenied.svg";
import './accessDenied.scss';
import { useTranslation } from "react-i18next";
const AccessDenied = () => {
  const { t } = useTranslation();
  const handleLogout = () => {
    const kcInstance = kcServiceInstance(); // Get the Keycloak instance
    kcInstance.userLogout();
  };

  return (
      <div className="d-flex flex-column  align-items-center text-center">
          <AccessDeniedIcon alt="Access Denied Icon" className="mb-4 mt-2"/>
      <h1 className="access-denied-text">{t("Access Denied")}</h1>
      <span className="access-denied">{t("You don't have permission to access this page.")}</span>
      <span className="access-denied">{t("Please contact your administrator or try again later.")}</span>
      <button className="btn btn-primary me-1 mt-4" onClick={handleLogout}>{t("Return to login")}</button>
    </div>
  );
};

export default AccessDenied;
