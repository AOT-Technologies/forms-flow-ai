import React from 'react';
import { connect } from 'react-redux';
import {deleteSubmission, resetSubmissions, selectError, Errors} from 'react-formio';
import {push, goBack} from 'connected-react-router';

import Confirm from '../../../../../containers/Confirm';

const Delete = props => (
  <div>
    <Errors errors={props.errors} />
    <Confirm {...props} />
  </div>
)

const mapStateToProps = (state) => {
  return {
    message: "Are you sure you wish to delete this submission?",
    errors: [
      selectError('submission', state),
      selectError('form', state)
    ],
  }
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onYes: () => {
      dispatch(deleteSubmission('submission', ownProps.match.params.submissionId, ownProps.match.params.formId, (err) => {
        if (!err) {
          dispatch(resetSubmissions('submissions'));
          dispatch(push(`/form/${ownProps.match.params.formId}/submission`));
        }
      }));
    },
  };
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Delete)
