import { INSIGHTS_BASE_API, INSIGHTS_API_KEY, WEB_BASE_URL, BPM_BASE_URL } from "./config";

const API = {
  INSIGHTS_API_KEY: INSIGHTS_API_KEY,
  GET_TASK_API: `${WEB_BASE_URL}/task`,
  GET_TASK_DETAIL_API: `${WEB_BASE_URL}/task/`,
  GET_DASHBOARDS: `${INSIGHTS_BASE_API}/dashboards`,
  METRICS_SUBMISSIONS: `${WEB_BASE_URL}/application/metrics`,
  APPLICATION_START: `${WEB_BASE_URL}/application/create`,
  PROCESS_STATE: `${WEB_BASE_URL}/process/<process_key>/task/<task_key>/state`,
  GET_APPLICATION: `${WEB_BASE_URL}/application/<application_id>`,
  GET_APPLICATION_HISTORY_API: `${WEB_BASE_URL}/application/<application_id>/history`,
  GET_ALL_APPLICATIONS_FROM_FORM_ID: `${WEB_BASE_URL}/application/formid`,
  GET_ALL_APPLICATIONS: `${WEB_BASE_URL}/application`,
  GET_PROCESS_MAPPER_FOR_APPLICATION: `${WEB_BASE_URL}/application/<application_id>/process`,
  PROCESSES: `${WEB_BASE_URL}/process`,
  PROCESS_ACTIVITIES: `${WEB_BASE_URL}/process/process-instance/<process_instance_id>/activity-instances`,
  FORM: `${WEB_BASE_URL}/form`,
  FORM_PROCESSES: `${WEB_BASE_URL}/form/formid`,
  APPLICATION_EVENT_UPDATE:`${WEB_BASE_URL}/process/event`,
  GET_BPM_TASKS:`${BPM_BASE_URL}/task`,
  GET_BPM_TASK_DETAIL:`${BPM_BASE_URL}/task/<task_id>`,
  GET_BPM_TASK_VARIABLES:`${BPM_BASE_URL}/task/<task_id>/variables`,
  CLAIM_BPM_TASK:`${BPM_BASE_URL}/task/<task_id>/claim`,
  UNCLAIM_BPM_TASK:`${BPM_BASE_URL}/task/<task_id>/unclaim`,
  GET_BPM_PROCESS_LIST:`${BPM_BASE_URL}/process-definition`,
  GET_BPM_USER_LIST:`${BPM_BASE_URL}/user`,
  GET_BPM_FILTERS:`${BPM_BASE_URL}/filter`,
};

export default API;
