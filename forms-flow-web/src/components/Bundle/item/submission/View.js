import React, { useEffect } from 'react';
import BundleSubmissionView from './BundleSubmissionView';
import { setBundleLoading, setBundleSelectedForms } from '../../../../actions/bundleActions';
import { clearFormError, clearSubmissionError, setFormFailureErrorData } from '../../../../actions/formActions';
import { getFormProcesses } from '../../../../apiManager/services/processServices';
import { executeRule } from '../../../../apiManager/services/bundleServices';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Errors } from "react-formio/lib/components";
import Loading from '../../../../containers/Loading';

const BundleView = ({bundleIdProp}) => {
  const { bundleId } = useParams();
  const dispatch = useDispatch();
  const bundleData = useSelector((state) => state.process.formProcessList);
  const selectedForms = useSelector((state) => state.bundle.selectedForms);
  const bundleSubmission = useSelector((state)=> state.bundle.bundleSubmission);
  const { error } = useSelector((state) => state.form);
  const loading = useSelector((state) => state.bundle.bundleLoading);

  useEffect(()=>{
  dispatch(setBundleLoading(true));
  dispatch(clearFormError("form"));
  dispatch(clearSubmissionError("submission"));
  dispatch(
    getFormProcesses(bundleIdProp || bundleId, (err, data) => {
      if (err) { 
        dispatch(setFormFailureErrorData("form", err));
        dispatch(setBundleLoading(false));
      } else {
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
},[bundleId, dispatch, bundleIdProp]);
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
      <div>
        {!selectedForms.length ? <Errors errors={error} /> : ""}
        {selectedForms.length ? (
         <BundleSubmissionView readOnly={true}/>
        ) : ""}
      </div>
    
  </div>
  );
};

export default BundleView;