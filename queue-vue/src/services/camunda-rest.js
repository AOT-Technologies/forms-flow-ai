import {bpmAxios} from '../axios';

class CamundaRest { 

  static getProcessDefinition(bearerToken) {
    return bpmAxios(bearerToken).get(`/process-definition?latestVersion=true`);
  }

  static getProcessDefinitionById(bearerToken, processDefinitionId) {
    return bpmAxios(bearerToken).get(`process-definition/${processDefinitionId}`);
  }  
   
  static startProcess(bearerToken, processDefinitionKey, values) {
    return bpmAxios(bearerToken).post(`/process-definition/key/${processDefinitionKey}/start`, values);
  }
    
  static getTasks(bearerToken) {
    return bpmAxios(bearerToken).get(`/task?sortBy=created&sortOrder=desc&maxResults=10`);
  }
    
  static getTaskById(bearerToken, taskId) {
    return bpmAxios(bearerToken).get(`/task/${taskId}`);
  }
    
  static complete(bearerToken, taskId, values) {
    return bpmAxios(bearerToken).post(`/task/${taskId}/complete`, values);
  }
  
  static claim(bearerToken, taskId) {
    return bpmAxios(bearerToken).post(`/task/${taskId}/claim`);
  }
    
  static unclaim(bearerToken, taskId) {
    return bpmAxios(bearerToken).post(`/task/${taskId}/unclaim`);
  }
    
  static getVariablesByTaskId(bearerToken, taskId) {
    return bpmAxios(bearerToken).get(`/task/${taskId}/variables`);
  }

  static getVariablesByProcessId(bearerToken, processInstanceId) {
    return bpmAxios(bearerToken).get(`/process-instance/${processInstanceId}/variables`);
  }

  static getUserList(bearerToken) {
    return bpmAxios(bearerToken).get(`/user`);
  }      

}

export default CamundaRest;
