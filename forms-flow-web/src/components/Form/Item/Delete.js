import React from 'react';
import { connect } from 'react-redux';
import { deleteForm, resetForms, selectError, Errors } from 'react-formio';
import {push, goBack} from 'connected-react-router';

import Confirm from '../../../containers/Confirm';

const Delete = props => (
  <div>
    <Errors errors={props.errors} />
    <Confirm {...props} />
  </div>
)

const mapStateToProps = (state) => {
  return {
    message: `Are you sure you wish to delete the form "${state.form.form.title}"?`,
    errors: selectError('form', state),
  }
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onYes: () => {
      dispatch(deleteForm('form', ownProps.match.params.formId, (err) => {
        if (!err) {
          dispatch(resetForms('forms'));
          dispatch(push('/'));
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
