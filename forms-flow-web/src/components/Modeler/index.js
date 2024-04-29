import React from "react";
import { Route, Routes, Navigate } from "react-router-dom-v6";
import { useSelector } from "react-redux";

import Base from "./Main";
import Edit from "./Edit";
import CreateWorkflow from "./Create";
import { STAFF_DESIGNER } from "../../constants/constants";
import Loading from "../../containers/Loading";

let user = "";

const DesignerProcessRoute = ({ element }) =>
  user.includes(STAFF_DESIGNER) ? (
    element
  ) : (
    <Navigate to="/unauthorized" replace />
  );

export default React.memo(() => {
  user = useSelector((state) => state.user?.roles || []);
  const isAuthenticated = useSelector((state) => state.user?.isAuthenticated);
  if (!isAuthenticated) {
    return <Loading />;
  }
  return (
    <div data-testid="Process-index">
      <Routes>
        <Route path="" element={<Base />} />
        <Route path={`/create`} element={<CreateWorkflow />} />
        <Route
          path={`/:processId`}
          element={<DesignerProcessRoute element={<Base />} />}
        />
        <Route
          path={`/:processId`}
          element={<DesignerProcessRoute element={<Base />} />}
        />
        <Route
          path={`/:type/:processId/edit`}
          element={<DesignerProcessRoute element={<Edit />} />}
        />

        {/* <Navigate exact to="/404" /> */}
      </Routes>
    </div>
  );
});
