import React  from "react"; 
import { Route, Switch, Redirect } from "react-router-dom";
import BundleSubmit from "./BundleSubmit"; 
import {
  BASE_ROUTE,
} from "../../../constants/constants"; 

const Item = React.memo(() => { 
  return (
    <div>
      <Switch>
        <Route exact path={`${BASE_ROUTE}bundle/:bundleId`} component={BundleSubmit} />
        <Redirect exact to="/404" />
      </Switch>
    </div>
  );
});

export default Item;
