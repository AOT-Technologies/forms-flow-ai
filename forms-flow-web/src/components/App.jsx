import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Provider } from "react-redux";
import { Route, Switch, Redirect } from "react-router-dom";
import { ConnectedRouter } from 'connected-react-router';

import Tasks from './Task/Task.js'; 
import Form from "../components/Form";
import NavBar from '../containers/NavBar';
import { STAFF_REVIEWER } from "../constants/constants";

class App extends Component{
  constructor(){
    super();
    this.user=[];
  }

  ListRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={(props) => (
      this.user.includes(STAFF_REVIEWER)
      ? <Component {...props} />
      : <Redirect exact to='/' />
      )} />
      )
      
  render(){
    const { store, history } = this.props;
    this.user = store.getState().user.roles;
    return(
  <div>
    <Provider store={store}>
      <ConnectedRouter  history={history}>
        <NavBar/>
        <Switch>
          <Route path="/form"><Form/></Route>
          <this.ListRoute exact path="/tasks" component={Tasks}/>
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
