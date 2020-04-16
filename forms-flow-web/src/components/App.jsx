import React from "react";
import PropTypes from 'prop-types';
import { Provider } from "react-redux";
import { Route, Switch, Redirect } from "react-router-dom";
import { ConnectedRouter } from 'connected-react-router';

import Form from "../components/Form";
import NavBar from '../containers/NavBar';

const App = ({ store, history }) => (
  <div>
    <Provider store={store}>
      <ConnectedRouter  history={history}>
        <NavBar/>
        <Switch>
          <Route path="/form"><Form/></Route>
          <Route path="/"><Redirect to="/form"/></Route>
        </Switch>
      </ConnectedRouter >
    </Provider>
  </div>
);

App.propTypes = {
  history: PropTypes.any.isRequired,
  store: PropTypes.any.isRequired
};

export default App;
