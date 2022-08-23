/* istanbul ignore file */
import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import StoreService from "./services/StoreService";
import { Formio, Components } from "react-formio";
import { AppConfig } from "./config";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "./styles.scss";
import "./resourceBundles/i18n.js";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { featureFlags } from "./featureToogle";
import { FlagsProvider } from 'flagged';

// disable react-dev-tools for this project
if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === "object") {
  for (let [key, value] of Object.entries(
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__
  )) {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] =
      typeof value == "function" ? () => {} : null;
  }
}

const store = StoreService.configureStore();
const history = StoreService.history;

Formio.setProjectUrl(AppConfig.projectUrl);
Formio.setBaseUrl(AppConfig.apiUrl);

// Set custom formio elements - Code splitted
import("formsflow-formio-custom-elements/dist/customformio-ex").then(
  (FormioCustomEx) => {
    Components.setComponents(FormioCustomEx.components);
  }
);

ReactDOM.render(
  <FlagsProvider features={featureFlags}>
     <App {...{ store, history }} />
  </FlagsProvider>,
  document.getElementById("app")
);

// Register service worker and if new changes skip waiting and activate new service worker
serviceWorkerRegistration.register({
  onUpdate: registration => {
    const waitingServiceWorker = registration.waiting;

    if (waitingServiceWorker) {
      waitingServiceWorker.addEventListener("statechange", event => {
        if (event.target.state === "activated") {
          window.location.reload();
        }
      });
      waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
    }
  }
});
