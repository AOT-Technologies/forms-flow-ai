import {
  httpPOSTRequest
} from "../httpRequestHandler";
import API from "../endpoints";
import {
  serviceActionError,
} from "../../actions/bpmActions";

export const getProcessReq = (form, submissionId, action, user) => {
  const requestFormat = {
    variables: {
      form_url: {
        value: `${window.location.origin}/form/${form._id}/submission/${submissionId}`,
      },
      submission_id: { value: submissionId },
      submitter_name: {
        value: user.name || user.preferred_username || "",
      },
      form_id: { value: form._id },
      form_name: { value: form.title },
      submission_date: { value: new Date().toJSON() }
      },
    formId: form._id,
    formSubmissionId: submissionId,
    formUrl:`${window.location.origin}/form/${form._id}/submission/${submissionId}`
  };
  return requestFormat;
};

export const triggerNotification = (data, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const URL = API.APPLICATION_START;
  return (dispatch) => {
    httpPOSTRequest(URL, data)
      .then((res) => {
        if (res.data) {
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
