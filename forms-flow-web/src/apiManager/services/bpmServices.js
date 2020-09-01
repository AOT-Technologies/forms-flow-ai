import {
  httpPOSTRequest
} from "../httpRequestHandler";
import API from "../endpoints";
import {
  sendEmailNotification,
  sendOneStepApproval,
  serviceActionError,
} from "../../actions/bpmActions";
import PROCESS from "../constants/processConstants";
// import { httpGETRequest, httpPOSTRequest } from "../httpRequestHandler";
export const getProcess = (processType, form, submissionId, action, user) => {
  switch (processType) {
    case PROCESS.EmailNotification:
      return {
        process: PROCESS.EmailNotification,
        service: sendEmailNotification,
        req: {
          variables: {
            category: { value: "submission_notification" },
            formurl: {
              value: `${window.location.origin}/form/${form._id}/submission/${submissionId}`,
            },
            submitter_name: {
              value: user.name || user.preferred_username || "",
            },
            submitter_email: { value: user.email || "" },
            submitted_datetime: { value: new Date().toJSON() },
            action: { value: action },
          },
          formId: form._id,
          formSubmissionId: submissionId,
        },
      };
    case PROCESS.OneStepApproval:
      return {
        process: PROCESS.OneStepApproval,
        service: sendOneStepApproval,
        req: {
          variables: {
            formurl: {
              value: `${window.location.origin}/form/${form._id}/submission/${submissionId}`,
            },
            submission_id: { value: submissionId },
            submitter_name: {
              value: user.name || user.preferred_username || "",
            },
            form_id: { value: form._id },
            form_name: { value: form.title },
            submission_date: { value: new Date().toJSON() },
            task_status: { value: "New" },
          },
          formId: form._id,
          formSubmissionId: submissionId,
        },
      };
    default:
      return null;
  }
};

export const triggerNotification = (data, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const URL = API.APPLICATION_START;
  return (dispatch) => {
    httpPOSTRequest(URL, data.req)
      .then((res) => {
        if (res.data) {
          dispatch(data.service(res.data));
          done(null, res.data);
        } else {
          dispatch(serviceActionError(res));
          done("Error Posting data");
        }
      })
      .catch((error) => {
        dispatch(serviceActionError(error));
        done(error);
      });
  };
};
