import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Provider } from "react-redux";
import { Route, Switch, Redirect } from "react-router-dom";
import { ConnectedRouter } from 'connected-react-router';

// import PublicRoute from "./PublicRoute";
import Form from "../components/Form";
import NavBar from '../containers/NavBar';
require('typeface-nunito-sans')

class App extends Component{
  render(){
    const { store, history } = this.props;
    return(
  <div>
    <Provider store={store}>
      <ConnectedRouter  history={history}>
        <NavBar store={store}/>
        <Switch>
          {/* <Route path="/public"><PublicRoute store={store}/></Route> */}
          <Route path="/form"><Form store={store}/></Route>
          <Route path="/"><Redirect to="/form"/></Route>
        </Switch>
      </ConnectedRouter >
    </Provider>
  </div>
    )
  }
}

App.propTypes = {
  history: PropTypes.any.isRequired,
  store: PropTypes.any.isRequired
};

export default App;
