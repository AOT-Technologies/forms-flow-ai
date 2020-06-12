import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
  isMetrixLoading: true,
  submissionsList: [],
  submissionsStatusList: [],
  isMetrixStatusLoading: true,
  selectedMEtrixId: 0,
  // tasksCount:0,
  // taskDetail: {},
  // isTaskUpdating:false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ACTION_CONSTANTS.IS_METRIX_LOADING:
      return { ...state, isMetrixLoading: action.payload };
    case ACTION_CONSTANTS.IS_METRIX_STATUS_LOADING:
      return { ...state, isMetrixStatusLoading: action.payload };
    case ACTION_CONSTANTS.METRIXSUBMISSIONS:
      return { ...state, submissionsList: action.payload };
    case ACTION_CONSTANTS.METRIX_SUBMISSIONS_STATUS:
      return { ...state, submissionsStatusList: action.payload };
    case ACTION_CONSTANTS.SELECTED_METRIX_ID:
      return { ...state, selectedMEtrixId: action.payload };
    case ACTION_CONSTANTS.TASK_SUBMISSION_DETAIL:
      return {
        ...state,
        taskDetail: { ...state.taskDetail, ...action.payload },
      };
    case ACTION_CONSTANTS.IS_TASK_UPDATING:
      return { ...state, isTaskUpdating: action.payload };
    default:
      return state;
  }
};
