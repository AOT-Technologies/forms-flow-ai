import moment from "moment";

export const taskSubmissionFormatter = (taskSubmissionData) =>{
  const res = {};
  taskSubmissionData.forEach(taskSubmission => res[taskSubmission.name] = taskSubmission.value);
  return res;
}


export const taskDetailVariableDataFormatter = (taskVariableData) =>{
  const res = {};
  for(let variable in taskVariableData){
    res[variable] = taskVariableData[variable].value;
  }
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

export const getProcessDataFromList = (processList,processId,dataKey) => {
  const process = processList.find(process=>process.id===processId);
  return process && process[dataKey] ;
}

export const getUserNamefromList = (userList,userId) => {
  const user = userList.find(user=>user.id===userId);
  return user?`${user.firstName} ${user.lastName}`: userId;
}

//formURl is of https://base-url/form/:formId/submission/:submissionId
export const getFormIdSubmissionIdFromFormURL = (formUrl) => {
  const formArr = formUrl.split("/");
  const formId = formArr[4];
  const submissionId = formArr[6];
  return {formId,submissionId};
}

export const getISODateTime=(date)=>{
  const dateTimeFormat = moment(date).format("yyyy-MM-DD[T]HH:mm:ss.SSSZ");
  const dateTimeArr = dateTimeFormat.split('+')
  const replaceTimezone = dateTimeArr[1].replace(':', '')
  return dateTimeFormat.replace(dateTimeArr[1], replaceTimezone)
  //return new Date(date).toISOString();
};

