import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux'
import { selectRoot, resetSubmissions, saveSubmission, Form, selectError, Errors, getForm } from 'react-formio';
import { push } from 'connected-react-router';
import { Link } from 'react-router-dom'

import Loading from '../../../containers/Loading';
import { getUserToken, triggerNotification, getProcess } from "../../../apiManager/services/bpmServices";
import { BPM_USER_DETAILS } from "../../../apiManager/constants/apiConstants";
import PROCESS from "../../../apiManager/constants/processConstants";

const View = class extends Component {
  UNSAFE_componentWillMount(){
    if(!this.props.isAuthenticated){
      this.props.getForm()
    }
  }

  render() {
    const {
      isAuthenticated,
      submission,
      hideComponents,
      onSubmit,
      errors,
      options,
      form: { form, isActive, url }
    } = this.props;
    if (isActive) {
      return <Loading />;
    }
    return (
      <div className="container">
        <div className="main-header">
          {isAuthenticated?
          <Link to="/form">
            <img src="/back.svg" alt="back" />
          </Link>
          :
          null
        }
          <span className="ml-3">
            <img src="/form.svg" alt="Forms" />
          </span>
          <h3>
            <span className="task-head-details">Forms /</span> New {form.title}
          </h3>
        </div>
        <Errors errors={errors} />
        <Form
          form={form}
          submission={submission}
          url={url}
          options={{ ...options }}
          hideComponents={hideComponents}
          onSubmit={onSubmit}
        />
      </div>
    );
  }
}

function doProcessActions(submission, ownProps) {
  return (dispatch, getState) => {
    let user = getState().user.userDetail
    let form = getState().form.form
    let IsAuth = getState().user.isAuthenticated
    dispatch(resetSubmissions('submission'));
    const data = getProcess(PROCESS.EmailNotification, form, submission._id, "new", user);
    dispatch(getUserToken(BPM_USER_DETAILS, (err, res) => {
      if (!err) {
        dispatch(triggerNotification(data));
        if(IsAuth){
          dispatch(push(`/${ownProps.match.params.formId}/submission/${submission._id}`))
        }
      }
    }));
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user.userDetail,
    form: selectRoot('form', state),
    isAuthenticated:state.user.isAuthenticated,
    errors: [
      selectError('form', state),
      selectError('submission', state),
    ],
    options: {
      noAlerts: false,
      i18n: {
        en: {
          error: "Please fix the errors before submitting again.",
        },
      }
    },
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    getForm:() => dispatch(getForm('form', ownProps.match.params.formId)),
    onSubmit: (submission) => {
      dispatch(saveSubmission('submission', submission, ownProps.match.params.formId, (err, submission) => {
        if (!err) {
          dispatch(doProcessActions(submission, ownProps))
        }
      }));
    },
  }
}



export default connect(
  mapStateToProps,
  mapDispatchToProps
)(View)
