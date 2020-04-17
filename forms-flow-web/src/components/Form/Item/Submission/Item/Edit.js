import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux'
import {selectRoot, resetSubmissions, saveSubmission, Form, selectError, Errors} from 'react-formio';
import {push} from 'connected-react-router';

import Loading from '../../../../../containers/Loading'
import {getUserToken, triggerNotification} from "../../../../../apiManager/services/bpmServices";
import {BPM_USER_DETAILS} from "../../../../../apiManager/constants/apiConstants";

const Edit = class extends Component {
  render() {
    const {
      hideComponents,
      onSubmit,
      options,
      errors,
      form: {form, isActive: isFormActive},
      submission: {submission, isActive: isSubActive, url}
    } = this.props;

    if (isFormActive || isSubActive) {
      return <Loading />;
    }

    return (
      <div className="detail-view">
        <h3 className="h3-form">Edit { form.title } Submission</h3>
        <Errors errors={errors} />
        <Form
          form={form}
          submission={submission}
          url={url}
          hideComponents={hideComponents}
          onSubmit={onSubmit}
          options={{...options}}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    form: selectRoot('form', state),
    submission: selectRoot('submission', state),
    options: {
      noAlerts: false,
      i18n: {
        en: {
          error:"Please fix the errors before submitting again.",
        },
      }
    },
    errors: [
      selectError('submission', state),
      selectError('form', state)
    ],
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSubmit: (submission) => {
      dispatch(saveSubmission('submission', submission, ownProps.match.params.formId, (err, submission) => {
        if (!err) {
          dispatch(resetSubmissions('submission'));
          dispatch(getUserToken(BPM_USER_DETAILS,(err,res)=>{
            if(!err){
              dispatch(triggerNotification({
                  "variables": {
                    "category" : {"value" : "task_notification"},
                    "formurl" : {"value" : `${window.location.origin}/form/${ownProps.match.params.formId}/submission/${submission._id}`}
                  }
                }
              ));
              dispatch(push(`/form/${ownProps.match.params.formId}/submission/${submission._id}`));
            }
          }));
        }
      }));
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Edit)
