import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux'
import { selectRoot, resetSubmissions, saveSubmission, Form, selectError, Errors } from 'react-formio';
import {push} from 'connected-react-router';
import Loading from '../../../containers/Loading';

import {triggerEmailNotification} from "../../../apiManager/services/bpmServices";

const View = class extends Component {
  render() {
    const {
      submission,
      hideComponents,
      onSubmit,
      errors,
      options,
      form: {form, isActive, url}
    } = this.props;
    if (isActive) {
      return <Loading />;
    }

    return (
      <div>
        <h3>New { form.title }</h3>
        <Errors errors={errors} />
        <hr />
        <Form
          form={form}
          submission={submission}
          url={url}
          options={{...options}}
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
          error:"Please fix the errors before submitting again.",
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
          dispatch(triggerEmailNotification({
                  variables: {
                    to : {value: submission.owner}
                  }
                }
              ));
          dispatch(push(`/${ownProps.match.params.formId}/submission/${submission._id}`))
        }
      }));
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(View)
