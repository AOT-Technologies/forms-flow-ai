import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux'
import {selectRoot, resetSubmissions, saveSubmission, Form, selectError, Errors} from 'react-formio';
import {push} from 'connected-react-router';
import Loading from '../../../containers/Loading'

const View = class extends Component {
  render() {
    const {
      hideComponents,
      onSubmit, options,
      errors,
      form: {form, isActive: isFormActive},
      submission: {submission, isActive: isSubActive, url}
    } = this.props;

    if (isFormActive || isSubActive) {
      return <Loading />;
    }

    return (
      <div>
        <h3>View Event</h3>
        <Errors errors={errors} />
        <Form
          form={form}
          submission={submission}
          url={url}
          hideComponents={hideComponents}
          onSubmit={onSubmit}
          options={options}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    form: selectRoot('form', selectRoot('event', state)),
    submission: selectRoot('submission', selectRoot('event', state)),
    options: {
      readOnly: true,
    },
    errors: [
      selectError('submission', selectRoot('event', state)),
      selectError('form', selectRoot('event', state))
    ],
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSubmit: (submission) => {
      dispatch(saveSubmission('event', submission, ownProps.match.params.formId, (err, submission) => {
        if (!err) {
          dispatch(resetSubmissions('event'));
          dispatch(push(`/event/${submission._id}`))
        }
      }));
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(View)
