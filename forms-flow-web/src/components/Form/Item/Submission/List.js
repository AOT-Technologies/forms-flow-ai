import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { getSubmissions, selectRoot, selectError, SubmissionGrid, Errors,deleteSubmission, resetSubmissions } from 'react-formio';

import Loading from '../../../../containers/Loading';
import { OPERATIONS, CLIENT } from '../../../../constants/constants';
import Confirm from '../../../../containers/Confirm';
import {setFormSubmissionDeleteStatus} from '../../../../actions/formActions'


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
    const { form, submissions, isLoading, onAction, getSubmissions, errors, userRoles,submissionFormId, submissionId,onNo,onYes} = this.props
    const operations = this.getOperations(userRoles)
    if (isLoading) {
      return (
        <Loading />
      );
    }

    return (
      <div className="container">
      <Confirm modalOpen={this.props.modalOpen}
      message= "Are you sure you wish to delete this submission?"
      onNo={() =>onNo()}
      onYes={() =>onYes(submissionFormId,submissionId,submissions)}
      >
      </Confirm>
        <div className="main-header">
          <Link to="/form">
            <img src="/back.svg" alt="back" />
          </Link>
          <span className="ml-3">
                        <img src="/form.svg" alt="Forms" />
                    </span>
          <h3>
            <span className="task-head-details">Forms /</span> {form.title}
          </h3>
          <Link className="btn btn-primary form-btn btn-right" to={`/form/${formId}`}>
            <i className='fa fa-plus' aria-hidden='true'/> New {form.title}
        </Link>
        </div>
        
        <section className="custom-grid">
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
    userRoles: selectRoot('user',state).roles||[],
    modalOpen: selectRoot('formDelete',state).formSubMissionDelete.modalOpen,
    submissionFormId: selectRoot('formDelete',state).formSubMissionDelete.formId,
    submissionId: selectRoot('formDelete',state).formSubMissionDelete.submissionId
  };
};
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    getSubmissions: (page, query) => dispatch(getSubmissions('submissions', page, query, ownProps.match.params.formId)),
    onAction: (submission, action) => {
      switch (action) {
        case 'viewSubmission':
        case 'row':
          dispatch(push(`/form/${ownProps.match.params.formId}/submission/${submission._id}`));
          break;
        case 'edit':
          dispatch(push(`/form/${ownProps.match.params.formId}/submission/${submission._id}/edit`));
          break;
        case 'delete':
          const submissionDetails={modalOpen:true,formId:ownProps.match.params.formId,submissionId:submission._id}
          dispatch(setFormSubmissionDeleteStatus(submissionDetails))
          break;
        default:

      }
    },
    onYes: (formId,submissionId,submissions) => {
      dispatch(deleteSubmission('submission',submissionId,formId,  (err) => {
        if (!err) {
          const submissionDetails={modalOpen:false,submissionId:"",formId:""}
          dispatch(setFormSubmissionDeleteStatus(submissionDetails))
         dispatch(getSubmissions('submissions', 1,submissions.query , ownProps.match.params.formId))
          
        }
      }));
    },
    onNo: () => {
      const submissionDetails={modalOpen:false,submissionId:"",formId:""}
      dispatch(setFormSubmissionDeleteStatus(submissionDetails))
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(List)
