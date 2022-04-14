 /* istanbul ignore file */
 import { httpDELETERequest, httpGETRequest,httpPOSTRequest, httpPUTRequest } from "../httpRequestHandler";
 import API from "../endpoints";
 import {
   setProcessStatusLoading,
   setProcessList,
   setProcessActivityLoadError,
   setProcessLoadError,
   setAllProcessList,
   setFormProcessesData,
   setFormProcessLoadError,
   setProcessActivityData,
   setProcessDiagramXML,
   setProcessDiagramLoading,
   setFormPreviosData,
   setApplicationCountResponse,
   setUnPublishApiError,
   setResetProcess
 } from "../../actions/processActions";
 import { setApplicationCount } from "../../actions/processActions";
 import { replaceUrl } from "../../helper/helper";
 import UserService from "../../services/UserService";
 import { toast } from "react-toastify";
 export const getProcessStatusList = (processId, taskId) => {
   return (dispatch) => {
     dispatch(setProcessStatusLoading(true));
     dispatch(setProcessLoadError(false));
     const apiUrlProcessId = replaceUrl(
       API.PROCESS_STATE,
       "<process_key>",
       processId
     );
 
     const apiURLWithtaskId = replaceUrl(apiUrlProcessId, "<task_key>", taskId);
 
     httpGETRequest(apiURLWithtaskId)
       .then((res) => {
         if (res.data) {
           dispatch(setProcessStatusLoading(false));
           dispatch(setProcessLoadError(false));
           dispatch(setProcessList(res.data.status));
         } else {
           dispatch(setProcessStatusLoading(false));
           dispatch(setProcessList([]));
           dispatch(setProcessLoadError(true));
         }
       })
       .catch((error) => {
         dispatch(setProcessStatusLoading(false));
         dispatch(setProcessLoadError(true));
       });
   };
 };
 
 /**
  *
  * @param  {...any} rest
  */
 export const fetchAllBpmProcesses = (...rest) => {
   const done = rest.length ? rest[0] : () => {};
   return (dispatch) => {
     httpGETRequest(API.PROCESSES, {}, UserService.getToken(), true)
       .then((res) => {
         if (res.data) {
           dispatch(setAllProcessList(res.data.process));
           done(null, res.data);
         } else {
           dispatch(setAllProcessList([]));
           dispatch(setProcessLoadError(true));
         }
       })
       .catch((error) => {
         // dispatch(setProcessStatusLoading(false));
         dispatch(setProcessLoadError(true));
       });
   };
 };
 
 /**
  *
  * @param  {...any} rest
  */
 export const getFormProcesses = (formId, ...rest) => {
   const done = rest.length ? rest[0] : () => {
   };
   return (dispatch) => {
     httpGETRequest(
       `${API.FORM_PROCESSES}/${formId}`,
       {},
       UserService.getToken(),
       true
     )
       .then((res) => {
         if (res.data) {
           dispatch(getApplicationCount(res.data.id));
           dispatch(setFormPreviosData(res.data));
           dispatch(setFormProcessesData(res.data));
          // need to check api and put exact respose
          done(null, res.data);
         } else {
           dispatch(setFormPreviosData([]))
           dispatch(setFormProcessesData([]));
           dispatch(setProcessLoadError(true));
          done('no data', null);
         }
       })
       .catch((error) => {
         // dispatch(setProcessStatusLoading(false));
         dispatch(setFormProcessLoadError(true));
       });
   };
 };
 
 export const getApplicationCount = (mapperId,...rest)=>{
  const done = rest.length ? rest[0] : () => {};
   return async(dispatch) => {
     let apiUrlClaimTask = replaceUrl(
       API.GET_FORM_COUNT,
       "<mapper id>",
        mapperId
     );
      await httpGETRequest(apiUrlClaimTask).then((res)=>{
         const applicationCount = +res.data?.value;
         dispatch(setApplicationCount(applicationCount));
         dispatch(setApplicationCountResponse(true));
        done(null,res)
       })
       .catch((error) => {
        // dispatch(setProcessStatusLoading(false));
        dispatch(setApplicationCount(0));
        dispatch(setApplicationCountResponse(true));
        done('no data', null);
      });
   }
 }
 
 export const saveFormProcessMapper = (data, update = false, ...rest) => {
   const done = rest.length ? rest[0] : () => {};
   return  async (dispatch) => {
     if (update) {
       httpPUTRequest(`${API.FORM}/${data.id}`, data).then(async(res) => {
         if(res.data){
        // dispatch(setFormProcessesData(res.data));
         done(null, res.data);
         }
         else{
          dispatch(setFormProcessesData([]));
          done(null, []);
         }
         // dispatch(setFormProcessesData([]));
       })
       .catch((error) => {
         dispatch(getFormProcesses(data.formId));
         dispatch(setFormProcessesData([]));
         toast.error("Form process failed");
         console.log("Error", error);
         dispatch(setFormProcessLoadError(true));
         done(error);
       });
     } else {
        httpPOSTRequest(`${API.FORM}`, data).then(async(res) => {

         if(res.data){  
           dispatch(getApplicationCount(res.data.id));
           dispatch(setFormProcessesData(res.data));
           done(null, res.data);
         }
         else{
          dispatch(setFormProcessesData([]));
          done(null, []);
         }
       })
       .catch((error) => {
         dispatch(getFormProcesses(data.formId));
         toast.error("Form process failed");
         console.log("Error", error);
         dispatch(setFormProcessLoadError(true));
         done(error);
       });
     }
     
 
   };
 };
 
 /**
  *
  * @param  {...any} rest
  */
 export const getProcessActivities = (process_instance_id, ...rest) => {
   const done = rest.length ? rest[0] : () => {};
   const apiUrlProcessActivities= replaceUrl(
     API.PROCESS_ACTIVITIES,
     "<process_instance_id>",
     process_instance_id
   );
   return (dispatch) => {
     httpGETRequest(
       apiUrlProcessActivities,
       {},
       UserService.getToken(),
       true
     )
       .then((res) => {
         if (res.data) {
           dispatch(setProcessActivityData(res.data.childActivityInstances));
           dispatch(setProcessActivityLoadError(false));
         } else {
           dispatch(setProcessActivityData(null));
           dispatch(setProcessActivityLoadError(true));
         }
         done(null,res.data);
       })
       .catch((error) => {
         done(error);
         dispatch(setProcessActivityData(null));
         dispatch(setProcessActivityLoadError(true));
       });
   };
 };
 
 export const fetchDiagram = (process_key, ...rest) => {
   const url =replaceUrl(API.PROCESSES_XML,"<process_key>",process_key)
   const done = rest.length ? rest[0] : () => {};
   return (dispatch) => {
     httpGETRequest(
       url,
       {},
       UserService.getToken(),
       true
     )
     .then((res) => {
       if (res.data && res.data.bpmn20Xml) {
         dispatch(setProcessDiagramXML(res.data.bpmn20Xml));
         // console.log('res.data.bpmn20Xml>>',res.data.bpmn20Xml);
       } else {
         dispatch(setProcessDiagramXML(""));
       }
       dispatch(setProcessDiagramLoading(false));
       done(null,res.data);
     })
     .catch((error) => {
         dispatch(setProcessDiagramXML(""));
         dispatch(setProcessDiagramLoading(false));
         done(error);
       });
   };
 };

 export const resetFormProcessData = ()=>{
  return(dispatch)=>{
    dispatch(setResetProcess())
  }
 }
 
 
 export const unPublishForm = (mapperId, ...rest) =>{
   const done = rest.length ? rest[0] : () => {};
   const url = replaceUrl(API.UNPUBLISH_FORMS,"<mapper id>",mapperId)
   return(dispatch) =>{
     httpDELETERequest(url).then((res)=>{
      toast.success(`Form deleted successfully`);
      dispatch(resetFormProcessData());
      done(null,res.data);
     })
     .catch((error)=>{
       toast.error("Form unpublishing Failed");
       console.log("error",error)
       dispatch(setUnPublishApiError(true));
       done(error);
     })
   }
 }