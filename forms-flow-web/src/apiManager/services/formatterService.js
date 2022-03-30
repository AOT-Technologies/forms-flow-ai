 /* istanbul ignore file */
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
    return  {value:dashboard.id, label:dashboard.name}
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
 // formURl is of https://base-url/public/form/:formId/submission/:submissionId
export const getFormIdSubmissionIdFromURL = (formUrl) => {
  let formString = "/form/"
  let submissionString = "/submission/"
  let firstPositionOfString = formUrl.indexOf("/form/")
  let lastPositionOfString = formUrl.indexOf("/submission")
  const formId = formUrl.substring(firstPositionOfString+formString.length,lastPositionOfString)
  let firstPositionOfSubmissionString = formUrl.indexOf(submissionString) + submissionString.length
  const submissionId = formUrl.substring(firstPositionOfSubmissionString)
  return {formId,submissionId};
}

export const getFormUrl = (formId, submissionId) => {
  return `${window.location.origin}/form/${formId}/submission/${submissionId}`;
}

export const getISODateTime=(date)=>{
    if(date){
      return moment(date).format('YYYY-MM-DD[T]HH:mm:ss.SSSZZ');
    }else{
      return null
    }
};

export const getFormattedDateAndTime = (date)=>{
  return new Date(date).toLocaleDateString('en-us',  {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',hour: '2-digit', minute: '2-digit', hour12: true});
};

export const getSearchText = (query) => {
  //  Function Extracts text from /text/i 
   let searchText = ""
   if(query !== ""){
     let searchString = "/"
     let firstPosition = query.indexOf('/')
     let lastPosition = query.indexOf('/i')
    searchText = query.substring(firstPosition + searchString.length,lastPosition)
   }
   return searchText;
}

export const getFormattedProcess = (application)=>{
  const processData = {
    processName:application.processName,
    formProcessMapperId:application.formProcessMapperId,
    processKey:application.processKey
  }
  return processData;
}

export const checkIsObjectId = (data) => {
  // Condition to check if the data is a mongoDb object Id or not 
  return data.length === 24 && !isNaN(Number('0x' + data));
}