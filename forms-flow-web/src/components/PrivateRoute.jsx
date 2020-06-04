import React, { Component, Fragment } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import UserService from '../services/UserService'
import Form from './Form';
import Task from './Task';
import { setUserAuth } from '../actions/bpmActions';
import { STAFF_REVIEWER } from '../constants/constants';
import Loading from '../containers/Loading';

class PrivateRoute extends Component {
  UNSAFE_componentWillMount() {
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
    console.log("dfsdf",this.props.user)
    return (
      <Fragment>
        { this.props.isAuth? 
        <>
        <Route path="/form" component={Form} />
        <this.TaskRoute path="/task" component={Task} />
        <Route exact path="/"><Redirect to="/form" /></Route>
       </>
       :
       <Loading/>
      }
      </Fragment>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user.roles || [],
    isAuth: state.user.isAuthenticated
  }
}

const mapStateToDispatch = (dispatch) => {
  return {
    setUserAuth: (value) => {
      dispatch(setUserAuth(value))
    }
  }
}

export default connect(mapStateToProps, mapStateToDispatch)(PrivateRoute);