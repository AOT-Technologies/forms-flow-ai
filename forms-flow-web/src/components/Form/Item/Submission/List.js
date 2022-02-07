import React, {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom'
import {connect, useDispatch, useSelector} from 'react-redux';
import {push} from 'connected-react-router';
import {getSubmissions, selectRoot, selectError, SubmissionGrid, Errors, deleteSubmission} from 'react-formio';
import cloneDeep from 'lodash/cloneDeep';

import Loading from '../../../../containers/Loading';
import {OPERATIONS, CLIENT, STAFF_REVIEWER} from '../../../../constants/constants';
import Confirm from '../../../../containers/Confirm';
import {setFormSubmissionDeleteStatus} from '../../../../actions/formActions'
import {getAllApplicationsByFormId} from "../../../../apiManager/services/applicationServices";
import {
  addApplicationDetailsToFormComponent,
  getRelevantApplications
} from "../../../../apiManager/services/formatterService";
import {defaultSubmissionData} from "../../../../constants/submissionConstants";
import {setApplicationListLoader} from "../../../../actions/applicationActions";



const getOperations = (userRoles) => {
  let operations = [];
  if (userRoles.includes(STAFF_REVIEWER)) {
    operations.push(OPERATIONS.view/*, OPERATIONS.deleteSubmission*/)
  }else if (userRoles.includes(CLIENT)) {
    operations.push(OPERATIONS.view)
  }
  return operations;
}

const List = React.memo((props) => {
  const dispatch = useDispatch();
  const {formId} = useParams();
  const {submissions, isLoading, onAction, getSubmissions, errors, userRoles, submissionFormId, submissionId, onNo, onYes} = props;
  const operations = getOperations(userRoles);
  const formApplicationsList = useSelector((state) => state.applications.formApplicationsList);
  const isApplicationsListLoading = useSelector((state) => state.applications.isApplicationListLoading);
  const form = useSelector((state)=>state.form.form);
  const [formData, setFormData] = useState();
  const [submissionListData, setSubmissionListData] = useState(defaultSubmissionData);

  useEffect(() => {
    dispatch(setApplicationListLoader(true))
    dispatch(getAllApplicationsByFormId(formId));
    getSubmissions(1);
  }, [getSubmissions, dispatch, formId ]);

  useEffect(()=>{
     if(form && form.components){
       setFormData(addApplicationDetailsToFormComponent(cloneDeep(form)))
     }
  },[ form, setFormData ]);

  useEffect(()=>{
    if(formApplicationsList.length && submissions){
      let updatedSubmissionList = getRelevantApplications(formApplicationsList,cloneDeep(submissions));
      setSubmissionListData(updatedSubmissionList);
    }
  },[formApplicationsList,submissions, setSubmissionListData])



//TODO add formApplicationLoader
  if (isLoading || isApplicationsListLoading) {
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
        <Link className="back-icon" to="/form">
        <i className="fa fa-chevron-left fa-lg" />
        </Link>
{/*        <span className="ml-3">
                        <img src="/form.svg" width="30" height="30" alt="form" />
                    </span>*/}
        <h3 className="ml-3">
          <span className="task-head-details"> <i className="fa fa-wpforms" aria-hidden="true"/><span className="forms-text">Forms /</span></span> {form.title}
        </h3>
        {/* {userRoles.includes(CLIENT) ? <Link className="btn btn-primary form-btn btn-right" to={`/form/${formId}`}>
        <img src="/webfonts/fa_plus.svg" alt="back"/> New Submisssion
        </Link> : null} */}
      </div>

      <section className="custom-grid">
        <Errors errors={errors}/>
        {formData && <SubmissionGrid
          submissions={submissionListData}
          form={formData}
          onAction={onAction}
          getSubmissions={getSubmissions}
          operations={operations}
        />}
      </section>
    </div>
  );
})

const mapStateToProps = (state) => {
  const form = selectRoot('form', state);
  const submissions = selectRoot('submissions', state);
  return {
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
