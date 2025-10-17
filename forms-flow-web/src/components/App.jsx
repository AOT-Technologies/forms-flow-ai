import React,{useState, useEffect} from "react";
import PropTypes from "prop-types";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import "../assets/styles/layouts.scss";
import "../assets/styles/user-styles.css";
import "../assets/styles/formioTooltip.scss";
import BaseRouting from "./BaseRouting";
import { Helmet } from "react-helmet";
import { KEYCLOAK_URL } from "../constants/constants";
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
const queryClient = new QueryClient();
import { HelperServices, StyleServices } from '@formsflow/service';
const customLogoPath =  StyleServices?.getCSSVariable("--custom-logo-path");
const customTitle = StyleServices?.getCSSVariable("--custom-title");
const hasMultitenancyHeader = customLogoPath || customTitle;
const App = React.memo((props) => {
  const { store, history, publish, subscribe, getKcInstance } = props;
  const [isPreviewRoute,setIsPreviewRoute] = useState(false);

  useEffect(() => {
    props.subscribe("ES_ROUTE", (msg,data) => {
      if (data) {
        const location = data.pathname;
        if(location)
          setIsPreviewRoute(() => HelperServices.hideSideBarRoute(location));
      }
    });
  }, []);

  return (
    //need to handle multitentant container. 
    <div className={`${hasMultitenancyHeader ? 'main-container-with-custom-header ' : ' page-container' } ${isPreviewRoute && 'm-0'}`}>
      <Helmet>
        {KEYCLOAK_URL ? <link rel="preconnect" href={KEYCLOAK_URL} /> : null}
      </Helmet>
      <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ConnectedRouter history={history}>
          <BaseRouting
            store={store}
            publish={publish}
            subscribe={subscribe}
            getKcInstance={getKcInstance}
          />
        </ConnectedRouter>
        </QueryClientProvider>
      </Provider>
    </div>
  );
});

App.propTypes = {
  history: PropTypes.any.isRequired,
  store: PropTypes.any.isRequired,
  subscribe: PropTypes.func,
};

export default App;
