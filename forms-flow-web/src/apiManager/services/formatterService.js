export const taskSubmissionFormatter = (taskSubmissionData) =>{
  const res = {};
  taskSubmissionData.forEach(taskSubmission => res[taskSubmission.name] = taskSubmission.value);
  return res;
}

export const insightDashboardFormatter = (dashboardsData) =>{
  const dashboards = dashboardsData.map(dashboard => {
    return  {value:dashboard.slug, label:dashboard.name}
  });
  return dashboards;
}


export const addApplicationDetailsToFormComponent = (formObjData) => {
   const applicationStatusComponent = formObjData.components.find(component => component.key === "applicationStatus");
   if(!applicationStatusComponent){
     formObjData.components.unshift({input:true,tableView: true, key:"applicationStatus", title:"Application Status"})
     formObjData.components.unshift({input:true,tableView: true,key:"applicationId", title:"Application Id"})
   }
  return formObjData;
}

export const getRelevantApplications = (applications, submissionData) => {
  //TODO UPDATE SUBMISSIONS VIEW
  submissionData.submissions = submissionData.submissions.map( submission => {
    const applicationData = applications.find(application => application.submissionId === submission._id);
    if(applicationData){
      submission.data.applicationId = applicationData.id;
      submission.data.applicationStatus = applicationData.applicationStatus;
      return submission;
    }else {
      return null;
    }
  }).filter(submission=>submission);
  return submissionData;
}


export const getLocalDateTime = (date) => {
  return date?new Date(date.replace(' ','T')+'Z').toLocaleString(): "-";
}
