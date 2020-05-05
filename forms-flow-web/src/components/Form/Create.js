import React from 'react';
import { connect } from 'react-redux';
import { saveForm, selectError, FormEdit, Errors } from 'react-formio';
import { push } from 'connected-react-router';
import { Link } from 'react-router-dom'

import { SUBMISSION_ACCESS } from '../../constants/constants';

const Create = props => {
  return (
      <div className="container">
      <div className="main-header">
      <Link to="/form">
            <img src="/back.svg" alt="back" />
          </Link>
          <span className="ml-3">
                        <img src="/form.svg" alt="Forms" />
                    </span>
                    <h3>
            <span className="task-head-details">Forms /</span> Create Form
          </h3>
      </div>

      <hr />
      <Errors errors={props.errors} />
      <FormEdit {...props} />
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    form: { display: 'form' },
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
      newForm.submissionAccess = SUBMISSION_ACCESS;
      dispatch(saveForm('form', newForm, (err, form) => {
        if (!err) {
          dispatch(push(`/form/${form._id}/preview`))
        }
      }))
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Create)
