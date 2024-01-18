import React from "react";
import { Route, Switch, Redirect, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import { BASE_ROUTE } from "../constants/constants";

import Footer from "../components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NotFound from "./NotFound";
import { useDispatch } from "react-redux";
import i18n from "../resourceBundles/i18n";
import { setLanguage } from "../actions/languageSetAction";
import { initPubSub } from "../actions/pubSubActions";
import { push } from "connected-react-router";

const BaseRouting = React.memo(
  ({ store, publish, subscribe, getKcInstance }) => {
    const user = useSelector((state) => state.user);
    const tenant = useSelector((state) => state.tenants);
    const dispatch = useDispatch();
    const isAuth = user.isAuthenticated;
    const location = useLocation();
    React.useEffect(() => {
      if (window.location.pathname !== location.pathname) {
        dispatch(push(window.location.pathname));
      }
    }, []);

    React.useEffect(() => {
      dispatch(initPubSub({ publish, subscribe }));
    }, [publish, subscribe]);

    React.useEffect(() => {
      subscribe("ES_CHANGE_LANGUAGE", (msg, data) => {
        i18n.changeLanguage(data);
        dispatch(setLanguage(data));
      });
    }, []);

    React.useEffect(() => {
      if (tenant) {
        publish("ES_TENANT", tenant);
      }
    }, [tenant]);

    React.useEffect(() => {
      publish("ES_ROUTE", location);
    }, [location]);

    return (
    
 
        <div className="container  mt-5">
        <div className="min-container-height ps-md-3">
        <ToastContainer />
            <Switch>
              <Route path="/public">
                <PublicRoute
                  store={store}
                  publish={publish}
                  subscribe={subscribe}
                  getKcInstance={getKcInstance}
                />
              </Route>
              <Route path={BASE_ROUTE}>
                <PrivateRoute
                  store={store}
                  publish={publish}
                  subscribe={subscribe}
                  getKcInstance={getKcInstance}
                />
              </Route>
              <Route path="/404" exact={true} component={NotFound} />
              <Redirect from="*" to="/404" />
            </Switch>
        </div>
            {isAuth ? <Footer /> : null}
        </div>

    );
  }
);

export default BaseRouting;
