import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import StoreService from "./services/StoreService";
// import UserService from "./services/UserService";

import { Formio} from 'react-formio';
import {AppConfig} from './config';
import * as serviceWorker from './serviceWorker';

import './styles.scss';

const store = StoreService.configureStore();
const history = StoreService.history;

Formio.setProjectUrl(AppConfig.projectUrl);
Formio.setBaseUrl(AppConfig.apiUrl);

ReactDOM.render(<App {...{ store, history }} />, document.getElementById("app"));
// const renderApp = () => ReactDOM.render(<App {...{ store, history }} />, document.getElementById("app"));

serviceWorker.register();
// UserService.initKeycloak(renderApp, store);
