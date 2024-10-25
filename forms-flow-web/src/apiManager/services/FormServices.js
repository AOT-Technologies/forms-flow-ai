import { RequestService } from "@formsflow/service";
import API from "../endpoints";
import { setCustomSubmission } from "../../actions/checkListActions";
import { replaceUrl } from "../../helper/helper";

export const formCreate = (formData) => {
  return RequestService.httpPOSTRequest(API.FORM_DESIGN, formData);
};

export const publish = (mapperId) => {
  const publishUrl = replaceUrl(API.PUBLISH, "<mapper_id>", mapperId);
  return RequestService.httpPOSTRequest(publishUrl);
};

export const unPublish = (mapperId) => {
  const unPublishUrl = replaceUrl(API.UN_PUBLISH, "<mapper_id>", mapperId);
  return RequestService.httpPOSTRequest(unPublishUrl);
};

export const formImport = (importData, data) => {
  return RequestService.httpMultipartPOSTRequest(API.FORM_IMPORT, importData, data);
};

export const formUpdate = (form_id,formData) => {
  return RequestService.httpPUTRequest(`${API.FORM_DESIGN}/${form_id}`, formData);
};

export const getFormHistory = (form_id, page = null, limit = null) => {
  let url = `${API.FORM_HISTORY}/${form_id}`;
  if (page !== null && limit !== null) {
    url += `?pageNo=${page}&limit=${limit}`;
  }
  return RequestService.httpGETRequest(url);
};


export const postCustomSubmission = (data, formId, isPublic, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const url = isPublic ? API.PUBLIC_CUSTOM_SUBMISSION : API.CUSTOM_SUBMISSION;
  const submissionUrl = replaceUrl(url, "<form_id>", formId);
  RequestService.httpPOSTRequest(`${submissionUrl}`, data)
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
  RequestService.httpPUTRequest(`${submissionUrl}/${data._id}`, data)
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
    RequestService.httpGETRequest(`${submissionUrl}/${submissionId}`, {})
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

export const validateFormName = (title, name, id) => {
  let url = `${API.VALIDATE_FORM_NAME}?title=${title}`;
  if (name) {
    url += `&name=${encodeURIComponent(name)}`;
  }
  if (id) {
    url += `&id=${encodeURIComponent(id)}`;
  }
  return RequestService.httpGETRequest(url);
};

export const getFormExport = (form_id) => {
  const exportFormUrl = replaceUrl(API.EXPORT_FORM, "<form_id>",form_id);
  return RequestService.httpGETRequest(exportFormUrl);
};