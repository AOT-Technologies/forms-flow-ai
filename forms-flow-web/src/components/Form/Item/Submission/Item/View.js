import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux'
import {selectRoot, resetSubmissions, saveSubmission, Form, selectError, Errors} from 'react-formio';
import {push} from 'connected-react-router';
import {Button} from "react-bootstrap";

import Loading from '../../../../../containers/Loading'
import PdfDownloadService from "../../../../../services/PdfDownloadService"

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
      <div className="detail-view mt-2">
        <h3 className="h3-form">View { form.title } Submission
        <Button className="btn btn-primary btn-sm form-btn pull-right" onClick={()=>PdfDownloadService.getPdf(form,submission)}><i class="fa fa-print" aria-hidden="true"></i> Print As PDF</Button></h3>

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
      readOnly: true,
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
          dispatch(push(`/form/${ownProps.match.params.formId}/submission/${submission._id}`))
        }
      }));
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(View)
