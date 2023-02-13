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
import { updateUserlang } from "../apiManager/services/userservices";
import { setLanguage } from "../actions/languageSetAction";

const BaseRouting = React.memo(({ store, publish, subscribe, getKcInstance }) => {
  const user = useSelector((state) => state.user);
  const tenant = useSelector((state) => state.tenants);
  const dispatch = useDispatch();
  const isAuth = user.isAuthenticated;
  const location = useLocation();

  const [language, setLang] = React.useState(null);


  subscribe("ES_CHANGE_LANGUAGE", (msg, data) => {
    i18n.changeLanguage(data);
  });

  subscribe("ES_UPDATE_LANGUAGE", (msg, data) => {
    setLang(data);
  });

  React.useEffect(() => {
    if (user) {
      publish("ES_USER", user);
    }
    if (tenant) {
      publish("ES_TENANT", tenant);
    }
  }, [user, tenant]);

  React.useEffect(() => {
    publish("ES_ROUTE", location);
  }, [location]);

  React.useEffect(() => {
    if (language) {
      dispatch(setLanguage(language));
      dispatch(updateUserlang(language));
    }
  }, [language]);

  return (
    <>
      <div className="wrapper">
        <div className="container-fluid content main-container">
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
          {isAuth ? <Footer /> : null}
        </div>
      </div>
    </>
  );
});

export default BaseRouting;
