import axios from 'axios';

class CamundaRest {
  static ENGINE_REST_ENDPOINT = '/engine-rest/';

  static getProcessDefinitions() {
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

  static taskClaim(taskId) {
    return axios.post(`${CamundaRest.ENGINE_REST_ENDPOINT}task/${taskId}/claim`);
  }

  static taskUnclaim(taskId) {
    return axios.post(`${CamundaRest.ENGINE_REST_ENDPOINT}task/${taskId}/unclaim`);
  }

  static getFormioProcessUrl(taskId) {
    return axios.get(`${CamundaRest.ENGINE_REST_ENDPOINT}task/${taskId}/variables`);
  }

}

export default CamundaRest;
