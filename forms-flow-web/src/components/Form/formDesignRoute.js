import React, { useMemo } from "react"; 
import { useSelector } from "react-redux";
import Stepper from "./Stepper";
import {
  STAFF_DESIGNER,
} from "../../constants/constants";
import Loading from "../../containers/Loading";
import { Routes, Route, Navigate } from "react-router-dom";

 
export default React.memo(() => {
  const userRoles = useSelector((state) => state.user.roles || []);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  if (!isAuthenticated) {
    return <Loading />;
  }
  
  const CreateFormRoute = useMemo(
    () =>
      ({ element }) =>
        userRoles.includes(STAFF_DESIGNER)  ? (
          element
        ) : (
          <Navigate to="/unauthorized" replace />
        ),
  
    [userRoles]
  );

  return (
      <Routes>
        <Route path=":formId?/:step?" element={<CreateFormRoute element={<Stepper/>}/>} />
        <Route path="*" element={<Navigate to="/404" replace/>} />
      </Routes>
  );
});
