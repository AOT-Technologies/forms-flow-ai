/* istanbul ignore file */
// eslint-disable-next-line no-unused-vars
import { AppConfig } from "../../config";

export const getProcessReq = (form, submissionId ) => {
  const requestFormat = {
    formId: form._id,
    submissionId: submissionId,
    formUrl: `${AppConfig.projectUrl}/form/${form._id}/submission/${submissionId}`,
  };
  return requestFormat;
};

export const getTaskSubmitFormReq = (formUrl, applicationId, actionType) => {
  let formRequestFormat = {
    variables: {
      formUrl: {
        value: formUrl,
      },
      applicationId: {
        value: applicationId,
      },
    },
  };
  if (actionType) {
    formRequestFormat.variables.action = {
      value: actionType,
    };
  }
  return formRequestFormat;
};

export const formatForms = (forms) => {
  return forms.map((form) => {
    return {
      _id: form.formId,
      title: form.formName,
      processKey: form.processKey,
    };
  });
}; 

export const getDraftReqFormat = (form, data)=>{
  return {
      formId: form._id,
      applicationStatus: "Draft",
      data: data
  };
};