import React from "react";
import Item from "./Item/index";
import { Routes, Route, Navigate } from "react-router-dom-v6";

const Form = React.memo(() => {
  return (
    <div>
      <Routes>
       <Route path={``} element={<Navigate to="/404" replace/>} />
        <Route
          path={`:submissionId`}
          element={<Item/>}
        />
      </Routes>
    </div>
  );
});

export default Form;
