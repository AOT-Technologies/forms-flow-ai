import { WEB_BASE_URL, BPM_BASE_URL} from "./config";
import {AppConfig} from "../../config";

const API = {
  GET_DASHBOARDS: `${WEB_BASE_URL}/dashboards`,
  METRICS_SUBMISSIONS: `${WEB_BASE_URL}/metrics`,
  APPLICATION_START: `${WEB_BASE_URL}/application/create`,
  PUBLIC_APPLICATION_START: `${WEB_BASE_URL}/public/application/create`,
  PUBLIC_APPLICATION_STATUS: `${WEB_BASE_URL}/public/form`,
  PROCESS_STATE: `${WEB_BASE_URL}/process/<process_key>/task/<task_key>/state`,
  GET_APPLICATION: `${WEB_BASE_URL}/application/<application_id>`,
  GET_APPLICATION_HISTORY_API: `${WEB_BASE_URL}/application/<application_id>/history`,
  GET_ALL_APPLICATIONS_FROM_FORM_ID: `${WEB_BASE_URL}/application/formid`,
  GET_ALL_APPLICATIONS: `${WEB_BASE_URL}/application`,
  GET_ALL_APPLICATIONS_STATUS: `${WEB_BASE_URL}/application/status/list`,
  PROCESSES: `${WEB_BASE_URL}/process`,
  PROCESSES_XML:`${BPM_BASE_URL}/process-definition/key/<process_key>/xml`,
  PROCESS_ACTIVITIES: `${BPM_BASE_URL}/process-instance/<process_instance_id>/activity-instances`,
  FORM: `${WEB_BASE_URL}/form`,
  FORM_PROCESSES: `${WEB_BASE_URL}/form/formid`,
  APPLICATION_EVENT_UPDATE:`${BPM_BASE_URL}/message`,
  GET_BPM_TASKS:`${BPM_BASE_URL}/task`,
  GET_BPM_TASK_DETAIL:`${BPM_BASE_URL}/task/<task_id>`,
  GET_BPM_TASK_VARIABLES:`${BPM_BASE_URL}/task/<task_id>/variables`,
  CLAIM_BPM_TASK:`${BPM_BASE_URL}/task/<task_id>/claim`,
  UNCLAIM_BPM_TASK:`${BPM_BASE_URL}/task/<task_id>/unclaim`,
  GET_BPM_PROCESS_LIST:`${BPM_BASE_URL}/process-definition`,
  GET_BPM_USER_LIST:`${BPM_BASE_URL}/user`,
  GET_BPM_FILTERS:`${BPM_BASE_URL}/filter`,
  GET_BPM_TASK_LIST_WITH_FILTER:`${BPM_BASE_URL}/filter/<filter_id>/list`,
  GET_BPM_TASK_LIST_COUNT_WITH_FILTER:`${BPM_BASE_URL}/filter/<filter_id>/count`,
  BPM_GROUP:`${BPM_BASE_URL}/task/<task_id>/identity-links`,
  DELETE_BPM_GROUP:`${BPM_BASE_URL}/task/<task_id>/identity-links/delete`,
  BPM_FORM_SUBMIT:`${BPM_BASE_URL}/task/<task_id>/submit-form`,
  GET_BPM_FORM_LIST:`${WEB_BASE_URL}/form`,
  UPDATE_ASSIGNEE_BPM_TASK:`${BPM_BASE_URL}/task/<task_id>/assignee`,
  GET_FORM_BY_ALIAS:`${AppConfig.projectUrl}/<form_path>`,
  GET_GROUPS:`${WEB_BASE_URL}/groups`,
  UPDATE_GROUPS:`${WEB_BASE_URL}/groups/<groupId>`,
  GET_FORM_COUNT:`${WEB_BASE_URL}/form/<mapper id>/application/count`,
  UNPUBLISH_FORMS:`${WEB_BASE_URL}/form/<mapper id>`
};

export default API;
