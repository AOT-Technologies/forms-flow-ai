import React from 'react';
import { connect } from 'react-redux';
import Confirm from '../../../containers/Confirm';
import _get from 'lodash/get';
import {deleteSubmission, resetSubmissions, selectError, Errors} from 'react-formio';
import {push, goBack} from 'connected-react-router';

const Delete = props => (
  <div>
    <Errors errors={props.errors} />
    <Confirm {...props} />
  </div>
)


const mapStateToProps = (state) => {
  return {
    message: `Are you sure you wish to delete the event "${_get(state, 'event.submission.submission.data.title', '')}"?`,
    errors: [
      selectError('submission', state),
      selectError('form', state)
    ],
  }
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onYes: () => {
      dispatch(deleteSubmission('event', ownProps.match.params.eventId, null, (err) => {
        if (!err) {
          dispatch(resetSubmissions('event'));
          dispatch(push(`/event`));
        }
      }));
    },
    onNo: () => {
      dispatch(goBack());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Delete)
