import { Route, Switch, Redirect } from 'react-router-dom'
import React from 'react'
import { connect } from 'react-redux'
import { selectRoot } from 'react-formio'

import List from './List';
import Create from './Create';
import Item from './Item/index';
import { STAFF_DESIGNER } from '../../constants/constants';

let user = '';

const CreateFormRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    user.includes(STAFF_DESIGNER)
      ? <Component {...props} />
      : <Redirect exact to='/' />
  )} />
)

const Form = (props) => {
  user = props.user;
  return (
    <div className="container" id="main">
      <Switch>
        <Route exact path="/form" component={List} />
        <CreateFormRoute exact path="/form/create" component={Create} />
        <Route path="/form/:formId" component={Item} />
      </Switch>
    </div>
  )
}

const mapStatetoProps = (state) => {
  return {
    user: selectRoot('user', state).roles || []
  }
}

export default connect(mapStatetoProps)(Form);
