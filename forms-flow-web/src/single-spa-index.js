import React from "react";
import ReactDOM from "react-dom";
import singleSpaReact from "single-spa-react";
import App from "./components/App";
import StoreService from "./services/StoreService";
import { featureFlags } from "./featureToogle";
import { FlagsProvider } from 'flagged';
import { Formio, Components } from "react-formio";
import { AppConfig } from "./config";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "./resourceBundles/i18n.js";

if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === "object") {
    for (let [key, value] of Object.entries(
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__
    )) {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] =
        typeof value == "function" ? () => {} : null;
    }
  }
  Formio.setProjectUrl(AppConfig.projectUrl);
  Formio.setBaseUrl(AppConfig.apiUrl);
  
  // Set custom formio elements - Code splitted
  import("formsflow-formio-custom-elements/dist/customformio-ex").then(
    (FormioCustomEx) => {
      Components.setComponents(FormioCustomEx.components);
    }
  );
const createRootComponent = (props)=>{
    const {publish, subscribe, getKcInstance} = props;
    const store = StoreService.configureStore();
    const history = StoreService.history;
    return <FlagsProvider features={featureFlags}>
        <App {...{ store, history, publish, subscribe, getKcInstance }} />
    </FlagsProvider>;
};

const reactLifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: createRootComponent,
  errorBoundary() {
    return <div>This renders when a catastrophic error occurs</div>;
  },
  renderType:'render'
});


export const { bootstrap, mount, unmount } = reactLifecycles;
