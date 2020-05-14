import React from 'react';
import { connect } from 'react-redux';
import { saveForm, selectForm, FormEdit, Errors, selectError } from 'react-formio';
import {push} from "connected-react-router";
import { Link } from 'react-router-dom'
import { SUBMISSION_ACCESS } from '../../../constants/constants';

const Edit = props => (
          <div className="container">
      <div className="main-header">
      <Link to="/form">
            <img src="/back.svg" alt="back" />
          </Link>
          <span className="ml-3">
                        <img src="/form.svg" alt="Forms" />
                    </span>
        <h3 className="task-head">Edit {props.form.title} Form</h3>
      </div>

    <hr />
    <Errors errors={props.errors} />
    <FormEdit {...props} />
  </div>
)

const mapStateToProps = (state) => {
  return {
    form: selectForm('form', state),
    saveText: 'Save Form',
    errors: selectError('form', state),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    saveForm: (form) =>{
      form.submissionAccess=SUBMISSION_ACCESS;
      return dispatch(saveForm('form', form, (err, form) => {
        if (!err) {
          // TODO: Display a save success message here.
          dispatch(push(`/form/${form._id}/preview`))
        }
      }))
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Edit)
