import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import store, { history } from './store'
import { initAuth, Formio, Components } from 'react-formio';
import App from './App'

import components from './components';
import {AppConfig} from './config';

import './styles.scss'

Formio.setProjectUrl(AppConfig.projectUrl);
Formio.setBaseUrl(AppConfig.apiUrl);
Components.setComponents(components);

// Initialize the current user
store.dispatch(initAuth());

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <div>
        <App />
      </div>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
)
