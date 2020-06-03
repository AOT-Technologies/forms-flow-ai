import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import UserService from '../services/UserService'
import Form from './Form';
import Task from './Task';
import { setUserAuth } from '../actions/bpmActions';
import { STAFF_REVIEWER } from '../constants/constants';

class PrivateRoute extends Component {
  componentDidMount() {
    UserService.initKeycloak(this.props.store, (err, res) => {
      this.props.setUserAuth(res.authenticated)
    })
  }
  TaskRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={(props) => (
      this.props.user.includes(STAFF_REVIEWER)
        ? <Component {...props} />
        : <Redirect exact to='/' />
    )} />
  )

  render() {
    return (
      <div className="container">
        <Route path="/form" component={Form} />
        <this.TaskRoute path="/task" component={Task} />
        <Route exact path="/"><Redirect to="/form" /></Route>
      </div>
    )
  }
}

const mapStatetoProps = (state) => {
  return {
    user: state.user.roles || [],
  }
}

const mapStateToDispatch = (dispatch) => {
  return {
    setUserAuth: (value) => {
      dispatch(setUserAuth(value))
    }
  }
}

export default connect(mapStatetoProps, mapStateToDispatch)(PrivateRoute);