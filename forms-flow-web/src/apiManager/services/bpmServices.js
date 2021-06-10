export const getProcessReq = (form, submissionId, action, user) => {
  const requestFormat = {
    formId: form._id,
    submissionId: submissionId,
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
const dynamicSort = (property) => {
  let sortOrder = 1;
  if(property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return  (a,b)=> {
    /* next line works with strings and numbers,
     * and you may want to customize it to your needs
     */
    const result = (a[property].toUpperCase() < b[property].toUpperCase()) ? -1 : (a[property].toUpperCase() > b[property].toUpperCase()) ? 1 : 0;
    return result * sortOrder;
  }
};

export const getPaginatedForms = (forms, limit, page, sort) => {
  if(sort){
    forms.sort(dynamicSort(sort));
    return forms.slice((page-1)*limit,((page-1)*limit)+limit);
  }else {
    return forms.slice((page-1)*limit,((page-1)*limit)+limit);
  }
}
