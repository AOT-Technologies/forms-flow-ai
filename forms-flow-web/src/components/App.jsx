import React from "react";
import PropTypes from 'prop-types';
import { Provider } from "react-redux";
import { Route } from "react-router-dom";
import { ConnectedRouter } from 'connected-react-router';
import Form from "../components/Form";
import NavBar from '../containers/NavBar';

const App = ({ store, history }) => (
  <div>
    <Provider store={store}>
      <ConnectedRouter  history={history}>
        {/* <Switch> */}
          <NavBar/>
          <Route path="/" component={Form}/>
          {/* <Route exact path="/" component={Form} /> */}
        {/* </Switch> */}
      </ConnectedRouter >
    </Provider>
  </div>
);

App.propTypes = {
  history: PropTypes.any.isRequired,
  store: PropTypes.any.isRequired
};

export default App;
