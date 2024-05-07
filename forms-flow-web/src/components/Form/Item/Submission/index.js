import React from "react";
import Item from "./Item/index";
import { Routes, Route, Navigate } from "react-router-dom";

const Form = React.memo(() => {
  return (
      <Routes>
       <Route path={``} element={<Navigate to="/404" replace/>} />
        <Route
          path={`:submissionId`}
          element={<Item/>}
        />
      </Routes>
     
  );
});

export default Form;
