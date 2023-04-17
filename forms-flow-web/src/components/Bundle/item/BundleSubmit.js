import React, { useEffect, useRef, useState } from "react";
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
import useInterval from "../../../customHooks/useInterval";
import { getDraftReqFormat } from "../../../apiManager/services/bpmServices";
import {
  DRAFT_POLLING_RATE,
} from "../../../constants/constants";
import SavingLoading from "../../Loading/SavingLoading";

import { isEqual } from "lodash"; 
import {
  draftCreate,
  draftUpdate,
  publicDraftCreate,
  publicDraftUpdate,
} from "../../../apiManager/services/draftService";
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
    const [poll, setPoll] = useState(DRAFT_ENABLED);
    const draftSubmissionId = useSelector(
      (state) => state.draft.draftSubmission?.id
    );
    // Holds the latest data saved by the server
    const lastUpdatedDraft = useSelector((state) => state.draft.lastUpdated); 
    const [isDraftCreated, setIsDraftCreated] = useState(false);
    const exitType = useRef("UNMOUNT");
    const [draftSaved, setDraftSaved] = useState(false);
    const [notified, setNotified] = useState(false);
    const draftCreateMethod = isAuthenticated ? draftCreate : publicDraftCreate;
    const draftUpdateMethod = isAuthenticated ? draftUpdate : publicDraftUpdate;
    const [draftSubmission, setDraftSubmission] = useState({});
    const [isValidResource, setIsValidResource] = useState(false);
    const draftRef = useRef();
    const formSubmissionError = useSelector(
      (state) => state.formDelete.formSubmissionError
    );

    
  useEffect(() => {
    setTimeout(() => {
      setNotified(true);
    }, 5000);
  }, []);


  useEffect(() => {
    if (isDraftCreated) {
      setDraftSaved(true);
    }
  }, [isDraftCreated]);

  
  useEffect(() => {
    if (bundleId && !error) setIsValidResource(true);
    return () => setIsValidResource(false);
  }, [error, bundleId]);
  /**
   * Will create a draft application when the form is selected for entry.
   */
  useEffect(() => {
    if (
      DRAFT_ENABLED &&
      isValidResource &&
      isAuthenticated &&
      bundleData.status === "active"
    ) {
      let payload = getDraftReqFormat(bundleId, draftSubmission?.data);
      dispatch(draftCreateMethod(payload, setIsDraftCreated));
    }
  }, [bundleId, isValidResource, bundleData.status]);
  /**
   * Compares the current form data and last saved data
   * Draft is updated only if the form is updated from the last saved form data.
   */
  const saveDraft = (payload, exitType = exitType) => {
    if (exitType === "SUBMIT") return;
    let dataChanged = !isEqual(payload.data, lastUpdatedDraft.data);
    if (draftSubmissionId && isDraftCreated) {
      if (dataChanged) {
        setDraftSaved(false);
        dispatch(
          draftUpdateMethod(payload, draftSubmissionId, (err) => {
            if (exitType === "UNMOUNT" && !err && isAuthenticated) {
              toast.success("Submission saved to draft.");
            }
            if (!err) {
              setDraftSaved(true);
            } else {
              setDraftSaved(false);
            }
          })
        );
      }
      //show success toaster - no datachange, but still draft is createdgit
      else {
        toast.success("Submission saved to draft.");
      }
    }
  };
  /**
   * We will repeatedly update the current state to draft table
   * on purticular interval
   */
  useInterval(
    () => {
      let payload = getDraftReqFormat(bundleId, { ...draftSubmission?.data });
      saveDraft(payload);
    },
    poll ? DRAFT_POLLING_RATE : null
  );

  /**
   * Save the current state when the component unmounts.
   * Save the data before submission to handle submission failure.
   */
  useEffect(() => {
    return () => {
      let payload = getDraftReqFormat(bundleId, draftRef.current?.data);
      if (poll) saveDraft(payload, exitType.current);
    };
  }, [bundleId, draftSubmissionId, isDraftCreated, poll, exitType.current]);



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

  const onSubmit = (submissionData, bundleId) =>{
    formioPostSubmission(submissionData, bundleId, true)
        .then((res) => { 
          setPoll(false);
          exitType.current = "SUBMIT";
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
           <>
        <span className="pr-2  mr-2 d-flex justify-content-end align-items-center">
          {!notified && (
            <span className="text-primary">
              <i className="fa fa-info-circle mr-2" aria-hidden="true"></i>
              {"Unfinished applications will be saved to Applications/Drafts."}
            </span>
          )}

          {notified && poll && (
            <SavingLoading
              text={draftSaved ? "Saved to Applications/Drafts" : "Saving..."}
              saved={draftSaved}
            />
          )}
        </span>
      </>
          {!selectedForms.length ? <Errors errors={error} /> : ""}
          {selectedForms.length ? (
           <BundleSubmission onSubmit={onSubmit} onChange={(e)=>{
            draftRef.current = e;
            setDraftSubmission(e);
          }} 
          />
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
