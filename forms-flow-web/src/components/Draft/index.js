import React from "react";
import { Route, Routes } from "react-router-dom-v6";
//import { BASE_ROUTE } from "../../constants/constants";
import DraftList from "./List";
import "../Application/Application.scss";
import ViewDraft from "./ViewDraft";
import EditDraft from "./EditDraft";
import NotFound from "../NotFound";
export default React.memo(() => {
  return (
    <Routes>
      <>
        <Route  path="" element={<DraftList/>} />
        <Route path={`/:draftId`} element={<ViewDraft />}/>
        <Route path={`/:draftId/:notavailable`} element={<NotFound />}/>
        <Route path={`form/:formId/draft/:draftId/edit`} element={<EditDraft />}/>
      </>
    </Routes>
  );
});
