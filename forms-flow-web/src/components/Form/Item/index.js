import { Route, Switch, Redirect } from 'react-router-dom'
import React, { Component } from 'react'
import View from './View'
import Edit from './Edit'
import Delete from './Delete'
import Submission from './Submission/index'
import { connect } from 'react-redux'
import { getForm } from 'react-formio'
import {STAFF_REVIEWER, CLIENT, STAFF_DESIGNER} from '../../../constants/constants'
/*import { Styles} from "./List.css";*/

let user = '';

const SubmissionRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    user.includes(STAFF_REVIEWER) || user.includes(CLIENT)
      ? <Component {...props} />
      : <Redirect exact to='/' />
  )} />
);
const FormActionRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    user.includes(STAFF_DESIGNER)
      ? <Component {...props} />
      : <Redirect exact to='/' />
  )} />
);

const Item = class extends Component{
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
          <FormActionRoute path="/form/:formId/edit" component={Edit}/>
          <FormActionRoute path="/form/:formId/delete" component={Delete}/>
          <SubmissionRoute path="/form/:formId/submission" component={Submission}/>
        </Switch>
      </div>
    )
  }
}

const mapStateToProps = () => {
  return {
    userRoles:localStorage.getItem('UserRoles')
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
