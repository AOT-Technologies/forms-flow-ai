import {BPM_BASE_URL, BPM_TOKEN_URL, PROCESS_BASE_API} from './config';

const API = {
  GET_BPM_TOKEN: BPM_TOKEN_URL,
  SEND_NOTIFICATION: PROCESS_BASE_API,
  GET_TASK_API: BPM_BASE_URL+'/history/task',
  GET_TASK_DETAIL_API: BPM_BASE_URL+ '/history/task?taskId=',
  GET_TASK_COUNT: BPM_BASE_URL+'/history/task/count',
  TASK_ACTION_API: BPM_BASE_URL+`/task`,
  GET_TASK_SUBMISSION_DATA: BPM_BASE_URL+'/history/variable-instance?processInstanceId='
}
//TODO update the process to read from json/API

export default API;
