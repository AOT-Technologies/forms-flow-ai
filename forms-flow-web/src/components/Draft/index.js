import React from "react";
import { Route, Routes } from "react-router-dom";
import DraftList from "./List";
import "../Application/Application.scss";
import ViewDraft from "./ViewDraft";
import EditDraft from "./EditDraft";
import NotFound from "../NotFound";
export default React.memo(() => {
  return (
    <Routes>
        <Route  path="" element={<DraftList/>} />
        <Route path={`:draftId`} element={<ViewDraft />}/>
        <Route path={`:draftId/edit`} element={<EditDraft />}/>
        <Route path={`:draftId/*`} element={<NotFound />}/>
    </Routes>
  );
});
