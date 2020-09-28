export const getProcessReq = (form, submissionId, action, user) => {
  const requestFormat = {
    formId: form._id,
    formSubmissionId: submissionId,
    formUrl:`${window.location.origin}/form/${form._id}/submission/${submissionId}`
  };
  return requestFormat;
};


