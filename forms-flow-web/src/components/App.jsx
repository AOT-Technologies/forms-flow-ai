import React from "react";
import PropTypes from "prop-types";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import "../assets/styles/layouts.scss";
import "../assets/styles/user-styles.css";
import BaseRouting from "./BaseRouting";
import { Helmet } from "react-helmet";
import { KEYCLOAK_URL } from "../constants/constants";
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
const queryClient = new QueryClient();
const App = React.memo((props) => {
  const { store, history, publish, subscribe, getKcInstance } = props;
  return (
    <div className="main-container">
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
};

export default App;
