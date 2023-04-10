import React, { useEffect } from 'react';
import BundleSubmissionView from './BundleSubmissionView';
import { setBundleLoading, setBundleSelectedForms, setBundleSubmissionData, setBundleSubmitLoading } from '../../../../actions/bundleActions';
import { clearFormError, clearSubmissionError, setFormFailureErrorData, setFormSubmissionError } from '../../../../actions/formActions';
import { getFormProcesses } from '../../../../apiManager/services/processServices';
import { executeRule } from '../../../../apiManager/services/bundleServices';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Errors } from "react-formio/lib/components";
import Loading from '../../../../containers/Loading';
import SubmissionError from '../../../../containers/SubmissionError';
import { MULTITENANCY_ENABLED } from '../../../../constants/constants';
import { toast } from 'react-toastify';
import { push } from 'connected-react-router';
import { getProcessReq } from '../../../../apiManager/services/bpmServices';
import { applicationCreate } from '../../../../apiManager/services/applicationServices';
import { formioPostSubmission } from '../../../../apiManager/services/FormServices';

const Edit = () => {
    const { bundleId } = useParams();
    const dispatch = useDispatch();
    const bundleData = useSelector((state) => state.process.formProcessList);
    const selectedForms = useSelector((state) => state.bundle.selectedForms);
    const bundleSubmission = useSelector((state)=> state.bundle.bundleSubmission);
    const { error } = useSelector((state) => state.form);
    const loading = useSelector((state) => state.bundle.bundleLoading); 
    const tenantKey = useSelector((state) => state.tenants?.tenantId);
    const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
    const formSubmissionError = useSelector(
        (state) => state.formDelete.formSubmissionError
      );
  
    useEffect(()=>{
    dispatch(setBundleLoading(true));
    dispatch(setBundleSubmissionData({}));
    dispatch(clearFormError("form"));
    dispatch(clearSubmissionError("submission"));
    dispatch(
      getFormProcesses(bundleId, (err, data) => {
        if (err) { 
          dispatch(setFormFailureErrorData("form", err));
          dispatch(setBundleLoading(false));
        } else {
            console.log('000000000000000000000000000000000');
          executeRule(bundleSubmission || {} ,data.id)
          .then((res) => {
            dispatch(setBundleSelectedForms(res.data));
           })
          .catch((err) => {
           dispatch(setFormFailureErrorData("form", err));
          })
          .finally(() => {
            dispatch(setBundleLoading(false));
          });
        }
      })
    );
    return()=>{
      dispatch(setBundleSelectedForms([]));
      };
  },[bundleId, dispatch]);

  const onConfirmSubmissionError = () => {
    const ErrorDetails = {
      modalOpen: false,
      message: "",
    };
    dispatch(setFormSubmissionError(ErrorDetails));
  };

  const onSubmit = (bundleSubmission, bundleId) =>{
    formioPostSubmission(bundleSubmission, bundleId, true)
        .then((res) => { 
          const origin = `${window.location.origin}${redirectUrl}`;
          const data = getProcessReq({_id: bundleData.formId}, res.data._id, origin);
          dispatch(applicationCreate(data,null,(err)=>{ 
            if(err){
              toast.error("Application not created");
            }else{
              toast.success("Submission Saved.");
              dispatch(push(`${redirectUrl}/form}`));
            }
          }));
         
        })
        .catch(() => {
          const ErrorDetails = {
            modalOpen: true,
            message: "Submission cannot be done.",
          };
          toast.error("Submission cannot be done.");
          dispatch(setFormSubmissionError(ErrorDetails));
        })
        .finally(() => {
           dispatch(setBundleSubmitLoading(false));
        });
  };

  if (loading) {
    return (
      <div data-testid="loading-view-component">
        <Loading />
      </div>
    );
  }
    return (
      <div className="p-3">
      <div className="d-flex align-items-center">
        <h3 className="ml-3">
          <span className="">
            <i className="fa fa-folder-o" aria-hidden="true"></i> Bundle/
          </span>
          {bundleData.formName}
        </h3>
      </div>
      <hr />
      <SubmissionError
        modalOpen={formSubmissionError.modalOpen}
        message={formSubmissionError.message}
        onConfirm={onConfirmSubmissionError}
      ></SubmissionError>
        <div>
          {!selectedForms.length ? <Errors errors={error} /> : ""}
          {selectedForms.length ? (
           <BundleSubmissionView onSubmit={onSubmit}/>
          ) : ""}
        </div>
      
    </div>
    );
  };

export default Edit;