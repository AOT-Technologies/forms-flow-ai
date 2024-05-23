import React from "react";
import { kcServiceInstance } from "../PrivateRoute"; // Import the kcServiceInstance function

const AccessDenied = () => {
  const handleLogout = () => {
    const kcInstance = kcServiceInstance(); // Get the Keycloak instance
    kcInstance.userLogout();
  };

  // const containerStyle = {
  //   display: "flex",
  //   flexDirection: "column",
  //   justifyContent: "center",
  //   alignItems: "center",
  //   height: "80vh",
  //   textAlign: "center",
  // };

 

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center">
      <h1>Access Denied</h1>
      <p>Please contact administrator to request access</p>
      <button className="btn btn-primary me-1" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default AccessDenied;
