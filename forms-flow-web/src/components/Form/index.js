import React from "react";
import { useSelector } from "react-redux";

import List from "./List";
import Item from "./Item/index";
import {
  STAFF_REVIEWER,
  CLIENT,
} from "../../constants/constants";
import Loading from "../../containers/Loading";
import { Routes, Route, Navigate } from "react-router-dom";



export default React.memo(() => {
  const userRoles = useSelector((state) => state.user.roles || []);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const isSubmissionPermitted = userRoles.includes(STAFF_REVIEWER) || userRoles.includes(CLIENT);

  if (!isAuthenticated) {
    return <Loading />;
  }

  
  return (
      <Routes>
        <Route path={``} element={<List/>} />
        <Route path={`:formId/*`} element={isSubmissionPermitted ? <Item/> : <Navigate to="/unauthorized" replace />} />
      </Routes>
  );
});
