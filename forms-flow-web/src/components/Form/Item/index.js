import { Route, Switch, Redirect } from 'react-router-dom'
import React, {PureComponent} from 'react'
import { getForm, selectRoot } from 'react-formio'
import { connect } from 'react-redux'

import {STAFF_REVIEWER, CLIENT, STAFF_DESIGNER} from '../../../constants/constants'
import View from './View'
import Edit from './Edit'
import Submission from './Submission/index'
import Preview from './Preview'

let user = '';
/**
 * Protected route to form submissions
 */
const SubmissionRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    user.includes(STAFF_REVIEWER) || user.includes(CLIENT)
      ? <Component {...props} />
      : <Redirect exact to='/' />
  )} />
);
/**
 * Protected route for form deletion
 */
const FormActionRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    user.includes(STAFF_DESIGNER)
      ? <Component {...props} />
      : <Redirect exact to='/' />
  )} />
);

const Item = class extends PureComponent{
  constructor() {
    super();

    this.state = {
      formId: ''
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.match.params.formId !== prevState.formId) {
      nextProps.getForm(nextProps.match.params.formId);
    }

    return {
      formId: nextProps.match.params.formId
    };
  }

  render() {
    user = this.props.userRoles;
    return (
      <div>
        <Switch>
          <Route exact path="/form/:formId" component={View} />
          <FormActionRoute path="/form/:formId/preview" component={Preview}/>
          <FormActionRoute path="/form/:formId/edit" component={Edit}/>
          <SubmissionRoute path="/form/:formId/submission" component={Submission}/>
        </Switch>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userRoles:selectRoot('user',state).roles||[]
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getForm: (id) => dispatch(getForm('form', id))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Item);
