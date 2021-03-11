export const getProcessReq = (form, submissionId, action, user) => {
  const requestFormat = {
    formId: form._id,
    formSubmissionId: submissionId,
    formUrl:`${window.location.origin}/form/${form._id}/submission/${submissionId}`
  };
  return requestFormat;
};


export const getTaskSubmitFormReq = (formUrl,applicationId) => {
  const formRequestFormat={
    variables: {
      formUrl: {
        value: formUrl
      },
      applicationId: {
        value: applicationId
      }
    }
  };
  return formRequestFormat;
}

