import {bpmAxios} from '../axios';

const CamundaRest = {   

  getProcessDefinitions(bearerToken) {
    return bpmAxios(bearerToken).get(`/process-definition?latestVersion=true`);
  },

  getProcessDefinitionById: (bearerToken, processDefinitionId) => {
    return bpmAxios(bearerToken).get(`process-definition/${processDefinitionId}`);
  },   
   
  startProcess(bearerToken, processDefinitionKey, values) {
    return bpmAxios(bearerToken).post(`/process-definition/key/${processDefinitionKey}/start`, values);
  },
    
  getTasks(bearerToken) {
    return bpmAxios(bearerToken).get(`/task?sortBy=created&sortOrder=desc&maxResults=10`);
  },
    
  getTaskById(bearerToken, taskId) {
    return bpmAxios(bearerToken).get(`/task/${taskId}`);
  },
    
  complete(bearerToken, taskId, values) {
    return bpmAxios(bearerToken).post(`/task/${taskId}/complete`, values);
  },    
  
  claim(bearerToken, taskId) {
    return bpmAxios(bearerToken).post(`/task/${taskId}/claim`);
  },
    
  unclaim(bearerToken, taskId) {
    return bpmAxios(bearerToken).post(`/task/${taskId}/unclaim`);
  },
    
  getVariablesByTaskId(bearerToken, taskId) {
    return bpmAxios(bearerToken).get(`/task/${taskId}/variables`);
  },

  getVariablesByProcessId(bearerToken, processInstanceId) {
    return bpmAxios(bearerToken).get(`/process-instance/${processInstanceId}/variables`);
  },

  getUsers(bearerToken) {
    return bpmAxios(bearerToken).get(`/user`)
  }      
}

export default CamundaRest;
