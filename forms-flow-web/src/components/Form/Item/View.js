import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux'
import { selectRoot, resetSubmissions, saveSubmission, Form, selectError, Errors } from 'react-formio';
import { push } from 'connected-react-router';

import Loading from '../../../containers/Loading';
import { getUserToken, triggerNotification, getProcess } from "../../../apiManager/services/bpmServices";
import { BPM_USER_DETAILS } from "../../../apiManager/constants/apiConstants";

const View = class extends Component {
  render() {
    const {
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
      <div>
        <h3>New {form.title}</h3>
        <Errors errors={errors} />
        <hr />
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

const mapStateToProps = (state) => {
  return {
    form: selectRoot('form', state),
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
    onSubmit: (submission) => {
      dispatch(saveSubmission('submission', submission, ownProps.match.params.formId, (err, submission) => {
        if (!err) {
          dispatch(resetSubmissions('submission'));
          //TODO update this
          let data = getProcess(1,ownProps.match.params.formId, submission._id)
          dispatch(getUserToken(BPM_USER_DETAILS, (err, res) => {
            if (!err) {
              dispatch(triggerNotification(data));
              dispatch(push(`/${ownProps.match.params.formId}/submission/${submission._id}`))
            }
          }));
        }
      }));
    },
  }
}



export default connect(
  mapStateToProps,
  mapDispatchToProps
)(View)
