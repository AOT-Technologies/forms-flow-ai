import React, { useMemo } from "react";
import { useSelector } from "react-redux";

import List from "./List";
import Item from "./Item/index";
import {
  STAFF_REVIEWER,
  CLIENT,
} from "../../constants/constants";
import Loading from "../../containers/Loading";
import { Routes, Route, Navigate } from "react-router-dom-v6";



export default React.memo(() => {
  const userRoles = useSelector((state) => state.user.roles || []);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  if (!isAuthenticated) {
    return <Loading />;
  }
  const FormSubmissionRoute = useMemo(
    () =>
      ({ element }) =>
        userRoles.includes(STAFF_REVIEWER) || userRoles.includes(CLIENT) ? (
          element
        ) : (
          <Navigate to="/unauthorized" replace />
        ),
  
    [userRoles]
  );
  
  return (
      <Routes>
        <Route path={``} element={<List/>} />
        <Route path={`:formId`} element={<FormSubmissionRoute element={<Item/>}/>} />
      </Routes>
  );
});
