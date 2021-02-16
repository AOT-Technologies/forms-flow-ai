import axios from 'axios';

class CamundaRest {
  static ENGINE_REST_ENDPOINT = '/engine-rest/';

  static getProcessDefinition() {
    return axios.get(`${CamundaRest.ENGINE_REST_ENDPOINT}process-definition?latestVersion=true`);
  }

  static getProcessDefinitionById(processDefinitionId) {
    return axios.get(`${CamundaRest.ENGINE_REST_ENDPOINT}process-definition/${processDefinitionId}`);
  }

  static deployProcessDefinition(file) {
    return axios.post(`${CamundaRest.ENGINE_REST_ENDPOINT}deployment/create`, file);
  }

  static getFormKey(processDefinitionKey) {
    return axios.get(`${CamundaRest.ENGINE_REST_ENDPOINT}process-definition/key/${processDefinitionKey}/startForm`);
  }

  static postProcessInstance(processDefinitionKey, values) {
    return axios.post(`${CamundaRest.ENGINE_REST_ENDPOINT}process-definition/key/${processDefinitionKey}/start`, values);
  }

  static getTasks() {
    return axios.get(`${CamundaRest.ENGINE_REST_ENDPOINT}task?sortBy=created&sortOrder=desc&maxResults=10`);
  }

  static getTask(taskId) {
    return axios.get(`${CamundaRest.ENGINE_REST_ENDPOINT}task/${taskId}`);
  }

  static postCompleteTask(taskId, values) {
    return axios.post(`${CamundaRest.ENGINE_REST_ENDPOINT}task/${taskId}/complete`, values);
  }

  static getTaskVariables(taskId, variableNames) {
    return axios.get(`${CamundaRest.ENGINE_REST_ENDPOINT}task/${taskId}/form-variables?variableNames=${variableNames}`);
  }

  static claim(taskId) {
    return axios.post(`${CamundaRest.ENGINE_REST_ENDPOINT}task/${taskId}/claim`);
  }

  static unclaim(taskId) {
    return axios.post(`${CamundaRest.ENGINE_REST_ENDPOINT}task/${taskId}/unclaim`);
  }

  static getVariablesByTaskId(taskId) {
    return axios.get(`/task/${taskId}/variables`);
  }

  static getVariablesByProcessId(processInstanceId) {
    return axios.get(`/process-instance/${processInstanceId}/variables`);
  }

  static getUserList() {
    return axios.get(`/user`);
  }

  static getProcessXML(processKey) {
    return axios.get(`engine-rest/process-definition/key/${processKey}/xml`)
  }
}

export default CamundaRest;