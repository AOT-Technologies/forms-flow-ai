import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Form } from 'react-formio';
import { AppConfig, AuthConfig } from "../../config";
import { setUser } from "react-formio";
import {push} from "connected-react-router";

const Register = class extends Component {
  render() {
    return (
      <Form {...this.props} />
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    src: AppConfig.projectUrl + '/' + AuthConfig.register.form
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSubmitDone: (submission) => {
      dispatch(push(AuthConfig.authState));
      dispatch(setUser(submission));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Register)
