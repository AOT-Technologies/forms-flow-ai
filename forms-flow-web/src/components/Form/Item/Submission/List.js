import React, {useEffect} from 'react';
import {Link, useParams} from 'react-router-dom'
import {connect, useDispatch} from 'react-redux';
import {push} from 'connected-react-router';
import {getSubmissions, selectRoot, selectError, SubmissionGrid, Errors, deleteSubmission} from 'react-formio';

import Loading from '../../../../containers/Loading';
import {OPERATIONS, CLIENT, STAFF_REVIEWER} from '../../../../constants/constants';
import Confirm from '../../../../containers/Confirm';
import {setFormSubmissionDeleteStatus} from '../../../../actions/formActions'
import {getAllApplicationsByFormId} from "../../../../apiManager/services/applicationServices";

const getOperations = (userRoles) => {
  let operations = []
  if (userRoles.includes(CLIENT)) {
    operations.push(OPERATIONS.view, OPERATIONS.editSubmission)
  } else if (userRoles.includes(STAFF_REVIEWER)) {
    operations.push(OPERATIONS.view, OPERATIONS.editSubmission, OPERATIONS.deleteSubmission)
  }
  return operations;
}

const List = (props) => {
  const dispatch = useDispatch();
  const {formId} = useParams();
  const {form, submissions, isLoading, onAction, getSubmissions, errors, userRoles, submissionFormId, submissionId, onNo, onYes} = props;


  const operations = getOperations(userRoles)
  useEffect(() => {
    getSubmissions(1);
    dispatch(getAllApplicationsByFormId(formId));
  }, [getSubmissions, dispatch, formId]);

  if (isLoading) {
    return (
      <Loading/>
    );
  }

  return (
    <div className="container">
      <Confirm modalOpen={props.modalOpen}
               message="Are you sure you wish to delete this submission?"
               onNo={() => onNo()}
               onYes={() => onYes(submissionFormId, submissionId, submissions)}
      >
      </Confirm>
      <div className="main-header">
        <Link to="/form">
          <img src="/back.svg" alt="back"/>
        </Link>
        <span className="ml-3">
                        <img src="/form.svg" alt="Forms"/>
                    </span>
        <h3>
          <span className="task-head-details">Forms /</span> {form.title}
        </h3>
        {userRoles.includes(CLIENT) ? <Link className="btn btn-primary form-btn btn-right" to={`/form/${formId}`}>
          <i className='fa fa-plus' aria-hidden='true'/> New Submisssion
        </Link> : null}
      </div>

      <section className="custom-grid">
        <Errors errors={errors}/>
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

const mapStateToProps = (state) => {
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
    userRoles: selectRoot('user', state).roles || [],
    modalOpen: selectRoot('formDelete', state).formSubMissionDelete.modalOpen,
    submissionFormId: selectRoot('formDelete', state).formSubMissionDelete.formId,
    submissionId: selectRoot('formDelete', state).formSubMissionDelete.submissionId
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
          const submissionDetails = {
            modalOpen: true,
            formId: ownProps.match.params.formId,
            submissionId: submission._id
          }
          dispatch(setFormSubmissionDeleteStatus(submissionDetails))
          break;
        default:
      }
    },
    onYes: (formId, submissionId, submissions) => {
      dispatch(deleteSubmission('submission', submissionId, formId, (err) => {
        if (!err) {
          const submissionDetails = {modalOpen: false, submissionId: "", formId: ""}
          dispatch(setFormSubmissionDeleteStatus(submissionDetails))
          dispatch(getSubmissions('submissions', 1, submissions.query, ownProps.match.params.formId))

        }
      }));
    },
    onNo: () => {
      const submissionDetails = {modalOpen: false, submissionId: "", formId: ""}
      dispatch(setFormSubmissionDeleteStatus(submissionDetails))
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(List)
