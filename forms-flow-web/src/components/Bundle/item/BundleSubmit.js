import React, { useEffect } from "react";
import BundleSubmission from "./BundleSubmissionComponent";
import { useDispatch, useSelector } from "react-redux";
import { setBundleLoading, setBundleSelectedForms, setBundleSubmissionData, setBundleSubmitLoading } from "../../../actions/bundleActions";
import { clearFormError, clearSubmissionError, setFormFailureErrorData, setFormSubmissionError } from "../../../actions/formActions";
import { getFormProcesses } from "../../../apiManager/services/processServices";
import { executeRule } from "../../../apiManager/services/bundleServices";
import { Link, useParams } from "react-router-dom";
import { DRAFT_ENABLED, MULTITENANCY_ENABLED, STAFF_DESIGNER } from "../../../constants/constants";
import Loading from "../../../containers/Loading";
import { Errors } from "react-formio/lib/components";
import SubmissionError from "../../../containers/SubmissionError";
import { formioPostSubmission } from "../../../apiManager/services/FormServices";
import { push } from "connected-react-router";
import { toast } from "react-toastify";
import { getProcessReq } from "../../../apiManager/services/bpmServices";
import selectApplicationCreateAPI from "../../Form/Item/apiSelectHelper";
const BundleSubmit = () => {
 
    const { bundleId } = useParams();
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.bundle.bundleLoading);
    const userRoles = useSelector((state)=> state.user.roles);
    const isDesigner = userRoles.includes(STAFF_DESIGNER);
    const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
    const tenantKey = useSelector((state) => state.tenants?.tenantId);
    const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
    const bundleData = useSelector((state) => state.process.formProcessList);
    const selectedForms = useSelector((state) => state.bundle.selectedForms);
    const draftId = useSelector((state)=> state.draft.draftSubmission?.id);
    const { error } = useSelector((state) => state.form);
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
          executeRule({},data.id)
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
          data.data = res.data?.data;
          let isDraftCreated = draftId ? true : false;
          const applicationCreateAPI = selectApplicationCreateAPI(
            isAuthenticated,
            isDraftCreated,
            DRAFT_ENABLED
          );
          dispatch(applicationCreateAPI(data, draftId ? draftId : null,(err)=>{ 
            if(err){
              toast.error("Application not created");
            }else{
              toast.success("Submission Saved.");
            }
            if(isAuthenticated){
              dispatch(push(`${redirectUrl}${isDesigner ? 'bundle' : 'form'}`));
            }
            dispatch(setBundleSubmitLoading(false));
          }));
         
        })
        .catch(() => {
          const ErrorDetails = {
            modalOpen: true,
            message: "Submission cannot be done.",
          };
          toast.error("Submission cannot be done.");
          dispatch(setFormSubmissionError(ErrorDetails));
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
        {isAuthenticated ? (
          <Link title="go back" to={`${redirectUrl}${isDesigner ? 'bundle' : 'form'}`}>
            <i className="fa fa-chevron-left fa-lg" />
          </Link>
        ) : null}

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
      {bundleData?.status === "active" ? (
        <div>
          {!selectedForms.length ? <Errors errors={error} /> : ""}
          {selectedForms.length ? (
           <BundleSubmission onSubmit={onSubmit}/>
          ) : (
            <h3 className="text-center">No Forms Selected</h3>
          )}
        </div>
      ) : (
        <div
          className="container"
          style={{
            maxWidth: "900px",
            margin: "auto",
            height: "50vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h3>{"Bundle not published"}</h3>
          <p>{"You can't submit this bundle until it is published"}</p>
        </div>
      )}
    </div>
  );
};

export default BundleSubmit;
