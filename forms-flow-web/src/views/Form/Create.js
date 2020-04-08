import React from 'react';
import { connect } from 'react-redux';
import { saveForm, selectError, FormEdit, Errors } from 'react-formio';
import {push} from 'connected-react-router';

const Create = props => {
  return (
    <div>
      <h2>Create Form</h2>
      <hr />
      <Errors errors={props.errors} />
      <FormEdit {...props} />
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    form: {display: 'form'},
    saveText: 'Create Form',
    errors: selectError('form', state),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    saveForm: (form) => {
      const newForm = {
        ...form,
        tags: ['common'],
      };
      dispatch(saveForm('form', newForm, (err, form) => {
        if (!err) {
          dispatch(push(`/form/${form._id}`))
        }
      }))
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Create)
