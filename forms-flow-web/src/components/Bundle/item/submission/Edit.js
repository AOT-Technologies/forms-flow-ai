import React, { useEffect } from "react";
import BundleSubmissionView from "../BundleSubmissionComponent";
import {
  setBundleLoading,
  setBundleSelectedForms,
  setBundleSubmissionData,
  setBundleSubmitLoading,
} from "../../../../actions/bundleActions";
import {
  setFormFailureErrorData,
  setFormSubmissionError,
} from "../../../../actions/formActions";
import { getFormProcesses } from "../../../../apiManager/services/processServices";
import { executeRule } from "../../../../apiManager/services/bundleServices";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Errors } from "react-formio/lib/components";
import Loading from "../../../../containers/Loading";
import SubmissionError from "../../../../containers/SubmissionError";
import {
  CUSTOM_SUBMISSION_ENABLE,
  CUSTOM_SUBMISSION_URL,
  MULTITENANCY_ENABLED,
} from "../../../../constants/constants";
import { toast } from "react-toastify";
import { push } from "connected-react-router";
import { updateApplicationEvent } from "../../../../apiManager/services/applicationServices";
import {
  formioUpdateSubmission,
  updateCustomSubmission,
} from "../../../../apiManager/services/FormServices";
import {
  UPDATE_EVENT_STATUS,
  getProcessDataReq,
} from "../../../../constants/applicationConstants";

const Edit = ({ bundleIdProp, onBundleSubmit, submissionIdProp }) => {
  const { bundleId, submissionId } = useParams();
  const dispatch = useDispatch();
  const bundleData = useSelector((state) => state.process.formProcessList);
  const selectedForms = useSelector((state) => state.bundle.selectedForms);
  const bundleSubmission = useSelector(
    (state) => state.bundle.bundleSubmission
  );
  const { error } = useSelector((state) => state.form);
  const loading = useSelector((state) => state.bundle.bundleLoading);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const applicationDetails = useSelector(
    (state) => state.applications.applicationDetail
  );
  const formSubmissionError = useSelector(
    (state) => state.formDelete.formSubmissionError
  );

  useEffect(() => {
    dispatch(setBundleLoading(true));
    dispatch(
      getFormProcesses(bundleId, (err, data) => {
        if (err) {
          dispatch(setFormFailureErrorData("form", err));
          dispatch(setBundleLoading(false));
        } else {
          executeRule(bundleSubmission || {}, data.id)
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
    return () => {
      dispatch(setBundleSelectedForms([]));
    };
  }, [bundleId, dispatch]);

  const onConfirmSubmissionError = () => {
    const ErrorDetails = {
      modalOpen: false,
      message: "",
    };
    dispatch(setFormSubmissionError(ErrorDetails));
  };

  const onSubmit = (bundleSubmission, bundleId) => {
    const callBack = (err, submission) => {
      if (!err) {
        if (
          UPDATE_EVENT_STATUS.includes(applicationDetails.applicationStatus)
        ) {
          const data = getProcessDataReq(applicationDetails);
          data.data = submission?.data;
          dispatch(
            updateApplicationEvent(data, () => {
              dispatch(setBundleSubmitLoading(false));
              if (onBundleSubmit) {
                onBundleSubmit();
              } else {
                toast.success("Submission Saved");
                dispatch(
                  push(
                    // eslint-disable-next-line max-len
                    `${redirectUrl}bundle/${bundleId}/submission/${
                      submissionIdProp || submissionId
                    }`
                  )
                );
              }
            })
          );
        } else {
          dispatch(setBundleSubmitLoading(false));
          if (onBundleSubmit) {
            onBundleSubmit();
          } else {
            toast.success("Submission Saved");
            dispatch(
              push(
                // eslint-disable-next-line max-len
                `${redirectUrl}bundle/${bundleId}/submission/${submission._id}`
              )
            );
          }
        }
      } else {
        dispatch(setBundleSubmitLoading(false));
        const ErrorDetails = {
          modalOpen: true,
          message: "Submission cannot be done.",
        };
        toast.error("Error while Submission.");
        dispatch(setFormSubmissionError(ErrorDetails));
      }
    };

    if (CUSTOM_SUBMISSION_URL && CUSTOM_SUBMISSION_ENABLE) {
      updateCustomSubmission(
        bundleSubmission,
        onBundleSubmit ? bundleIdProp : bundleId,
        callBack
      );
    } else {
      formioUpdateSubmission(
        bundleSubmission,
        bundleId,
        submissionIdProp || submissionId,
        true
      )
        .then((res) => {
          dispatch(setBundleSubmissionData({ data: res.data.data }));
          callBack(null, res.data);
        })
        .catch(() => {
          const ErrorDetails = {
            modalOpen: true,
            message: "Submission cannot be done.",
          };
          toast.error("Submission cannot be done.");
          dispatch(setFormSubmissionError(ErrorDetails));
        });
    }
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
          <BundleSubmissionView onSubmit={onSubmit} />
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default Edit;
