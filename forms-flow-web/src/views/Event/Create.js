import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux'
import {selectRoot, resetSubmissions, saveSubmission, Form, selectError, Errors, getForm} from 'react-formio';
import {push} from 'connected-react-router';
import Loading from '../../containers/Loading';

const View = class extends Component {
  componentWillMount() {
    this.props.getForm();
  }

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
        <Form
          form={form}
          submission={submission}
          url={url}
          options={options}
          hideComponents={hideComponents}
          onSubmit={onSubmit}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    form: selectRoot('form', selectRoot('event', state)),
    errors: [
      selectError('form', selectRoot('event', state)),
      selectError('submission', selectRoot('event', state)),
    ],
    options: {
      noAlerts: true
    },
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    getForm: () => dispatch(getForm('event')),
    onSubmit: (submission) => {
      dispatch(saveSubmission('event', submission, null, (err, submission) => {
        if (!err) {
          dispatch(resetSubmissions('event'));
          dispatch(push(`/event`))
        }
      }));
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(View)
