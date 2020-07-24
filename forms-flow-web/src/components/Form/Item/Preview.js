import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux'
import {selectRoot, Form, selectError, Errors} from 'react-formio';
import {push} from 'connected-react-router';
import {Button} from "react-bootstrap";
import { Link } from 'react-router-dom'

import Loading from '../../../containers/Loading'

const Preview = class extends Component {
  render() {
    const {
      hideComponents,
      onSubmit, options,
      errors,
      form: {form, isActive: isFormActive},
      dispatch,
      submission: {submission, isActive: isSubActive, url}
    } = this.props;
    if (isFormActive || isSubActive) {
      return <Loading />;
    }

    return (
      <div className="container">
      <div className="main-header">
      <Link to="/form">
            <img src="/back.svg" alt="back" />
          </Link>
          <span className="ml-3">
                        <img src="/form.svg" alt="Forms" />
                    </span>
        <h3 className="task-head">{ form.title } Submission</h3>
        <Button className="btn btn-primary btn-sm form-btn pull-right btn-right" onClick={()=>{dispatch(push(`/form/${form._id}/edit`))}}>
            <i className="fa fa-pencil" aria-hidden="true"></i>
            &nbsp;&nbsp;Edit Form
        </Button>
      </div>

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

export default connect(
  mapStateToProps
)(Preview)
