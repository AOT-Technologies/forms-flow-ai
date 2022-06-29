/* istanbul ignore file */
import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import StoreService from "./services/StoreService";
import { Formio, Components } from "react-formio";
import { AppConfig } from "./config";
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import components from "./customFormioComponents";
import "./styles.scss";
import "./resourceBundles/i18n.js";

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
Components.setComponents(components);

ReactDOM.render(
  <App {...{ store, history }} />,
  document.getElementById("app")
);
