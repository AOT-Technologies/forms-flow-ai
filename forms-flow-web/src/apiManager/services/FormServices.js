import {
  httpPOSTRequest,
  httpGETRequest,
  httpPUTRequest,
} from "../httpRequestHandler";
// httpGETRequest,
import API from "../endpoints";
import { setCustomSubmission } from "../../actions/checkListActions";
import { replaceUrl } from "../../helper/helper";

export const formCreate = (formData, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  httpPOSTRequest(API.FORM_CREATION, formData)
    .then((res) => {
      if (res.data) {
        done(null, res.data);
      }
    })
    .catch((err) => {
      if (err.response?.data) {
        done(err.response.data);
      } else {
        done(err.message);
      }
    });
};

export const postCustomSubmission = (data, formId, isPublic, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const url = isPublic ? API.PUBLIC_CUSTOM_SUBMISSION : API.CUSTOM_SUBMISSION;
  const submissionUrl = replaceUrl(url, "<form_id>", formId);
  httpPOSTRequest(`${submissionUrl}`, data)
    .then((res) => {
      if (res.data) {
        done(null, res.data);
      } else {
        done("Error Posting data", null);
      }
    })
    .catch((err) => {
      done(err, null);
    });
};

export const updateCustomSubmission = (data, formId, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const submissionUrl = replaceUrl(API.CUSTOM_SUBMISSION, "<form_id>", formId);
  httpPUTRequest(`${submissionUrl}/${data._id}`, data)
    .then((res) => {
      if (res.data) {
        done(null, res.data);
      } else {
        done("Error updating data", null);
      }
    })
    .catch((err) => {
      done(err, null);
    });
};

export const getCustomSubmission = (submissionId, formId, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const submissionUrl = replaceUrl(API.CUSTOM_SUBMISSION, "<form_id>", formId);

  return (dispatch) => {
    httpGETRequest(`${submissionUrl}/${submissionId}`, {})
      .then((res) => {
        if (res.data) {
          dispatch(setCustomSubmission(res.data));
        } else {
          dispatch(setCustomSubmission({}));
        }
      })
      .catch((err) => {
        done(err, null);
      });
  };
};
