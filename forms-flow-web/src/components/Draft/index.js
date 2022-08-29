import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { BASE_ROUTE } from "../../constants/constants";
import DraftList from "./List";
import "../Application/Application.scss";
import ViewDraft from "./ViewDraft";
import EditDraft from "./EditDraft";

export default React.memo(() => {
  return (
    <div className="container">
      <Switch>
        <>
          <Route exact path={`${BASE_ROUTE}draft`} component={DraftList} />
          <Route path={`${BASE_ROUTE}draft/:draftId`}>
            <ViewDraft />
          </Route>
          <Route path={`${BASE_ROUTE}draft/:draftId/:notavailable`}>
            <Redirect exact to="/404" />
          </Route>
          <Route path={`${BASE_ROUTE}form/:formId/draft/:draftId/edit`}>
            <EditDraft />
          </Route>
        </>
      </Switch>
    </div>
  );
});
