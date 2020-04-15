import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { getSubmissions, selectRoot, selectError, SubmissionGrid, Errors } from 'react-formio';

import Loading from '../../../../containers/Loading';
import { OPERATIONS, CLIENT } from '../../../../constants/constants';

const List = class extends Component {
  componentWillMount() {
    this.props.getSubmissions(1);
  }

  getOperations(userRoles){
    let operations = []
    if(userRoles.includes(CLIENT)){
      operations.push(OPERATIONS.view, OPERATIONS.editSubmission)
    }else{
      operations.push(OPERATIONS.view, OPERATIONS.editSubmission, OPERATIONS.deleteSubmission)
    }
    return operations;
  }

  render() {
    const { match: { params: { formId } } } = this.props
    const { form, submissions, isLoading, onAction, getSubmissions, errors, userRoles } = this.props
    const operations = this.getOperations(userRoles)
    if (isLoading) {
      return (
        <Loading />
      );
    }

    return (
      <div>
        <header>
          <h4 className="text-capitalize">{form.title}</h4>
          <Link className="btn btn-primary btn-sm form-btn pull-right" to={`/form/${formId}`}>
            <i className='fa fa-plus' aria-hidden='true'></i> New {form.title}
          </Link>
        </header>
        <br></br>
        <section className="mt-5">
          <Errors errors={errors} />
          <SubmissionGrid
            submissions={submissions}
            form={form}
            onAction={onAction}
            getSubmissions={getSubmissions}
            operations={operations}
          />
        </section>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const form = selectRoot('form', state);
  const submissions = selectRoot('submissions', state);

  return {
    form: form.form,
    submissions: submissions,
    isLoading: form.isActive || submissions.isActive,
    errors: [
      selectError('submissions', state),
      selectError('form', state)
    ],
    userRoles: selectRoot('user',state).roles||[]
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    getSubmissions: (page, query) => dispatch(getSubmissions('submissions', page, query, ownProps.match.params.formId)),
    onAction: (submission, action) => {
      switch (action) {
        case 'view':
        case 'row':
          dispatch(push(`/form/${ownProps.match.params.formId}/submission/${submission._id}`));
          break;
        case 'edit':
          dispatch(push(`/form/${ownProps.match.params.formId}/submission/${submission._id}/edit`));
          break;
        case 'delete':
          dispatch(push(`/form/${ownProps.match.params.formId}/submission/${submission._id}/delete`));
          break;
        default:
      }
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(List)
