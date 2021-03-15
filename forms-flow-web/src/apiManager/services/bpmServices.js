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

export const formatForms = (forms) => {
  return forms.map(form=> {
    return {"_id":form.formId , "title": form.formName, processKey:form.processKey}
  });
}

