import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { BASE_ROUTE } from "../../constants/constants";
import DraftList from "./List";
import "./Draft.scss";
import ViewDraft from "./ViewDraft";

export default React.memo(() => {
  return (
    <div className="container" id="main">
      <Switch>
        <>
          <Route exact path={`${BASE_ROUTE}draft`} component={DraftList} />
          <Route path={`${BASE_ROUTE}draft/:draftId`}>
            <ViewDraft />
          </Route>
          <Route path={`${BASE_ROUTE}draft/:draftId/:notavailable`}>
            <Redirect exact to="/404" />
          </Route>
        </>
      </Switch>
    </div>
  );
});
