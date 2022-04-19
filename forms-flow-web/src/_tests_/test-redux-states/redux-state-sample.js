import {form, forms, submission, submissions} from "react-formio";
import {TASK_FILTER_LIST_DEFAULT_PARAM} from "../../constants/taskConstants";
import {QUERY_TYPES} from "../../components/ServiceFlow/constants/taskConstants";


export const appState = {
  applications:{
    applicationsList:[],
    applicationDetail: {},
    applicationProcess: {},
    formApplicationsList:[],
    isApplicationListLoading:false,
    isApplicationDetailLoading:false,
    isApplicationUpdating:false,
    applicationCount:0,
    applicationDetailStatusCode:'',
    isPublicStatusLoading:false
  },
  user:{
    bearerToken: '',
    roles: '',
    userDetail:null,
    isAuthenticated:false,
    currentPage:'',
    showApplications:false,
    showViewSubmissions:false
  },
  tasks:{
    isLoading:true,
    tasksList:[],
    tasksCount:0,
    taskDetail: {},
    isTaskUpdating:false,
    appHistory:[],
    isHistoryListLoading: true
  },
  insights:{
    isDashboardLoading:true,
    dashboardsList:[],
    dashboardDetail: {},
    isInsightLoading:true,
  },
  formDelete:{
    formSubMissionDelete:{modalOpen:false,submissionId:"",formId:""},
    formDelete:{modalOpen:false,formId:"",formName:""},
    formSubmissionError:{modalOpen:false,message:""},
    isFormSubmissionLoading: false,
    isFormWorkflowSaved: false,
    formSubmitted:false,
    publicFormStatus:null
  },
  bpmTasks:{
    isTaskListLoading:false,
    tasksList:[],
    tasksCount:0,
    taskDetail: null,
    isTaskUpdating:false,
    appHistory:[],
    isHistoryListLoading: true,
    isTaskDetailLoading:true,
    isTaskDetailUpdating:false,
    isGroupLoading:false,
    processList:[],
    userList:[],
    filterList:[],
    isFilterLoading:true,
    selectedFilter:null,
    taskId:null,
    filterListSortParams:{sorting:[{...TASK_FILTER_LIST_DEFAULT_PARAM}]},
    filterSearchSelections:[],
    filterListSearchParams:{},
    listReqParams:{sorting:[{...TASK_FILTER_LIST_DEFAULT_PARAM}]},
    searchQueryType:QUERY_TYPES.ALL,
    variableNameIgnoreCase:false,
    variableValueIgnoreCase:false,
    taskGroups:[],
    taskFormSubmissionReload:false,
    activePage:1,
    firstResult:0
  },
  bpmForms:{
    error: '',
    formsFullList:[],
    forms: [],
    isActive: false,
    limit:10,
    pagination: {
      numPages: 0,
      page: 1,
      total: 0,
    },
    query:{},
    select:'',
    sort:'',
    totalForms:"",
    maintainPagination:false
  },
  form: form({ name: "form" }),
  forms: forms({ name: "forms", query: { type: "form", tags: "common" }, sort: "-created" }),
  submission: submission({ name: "submission" }),
  submissions: submissions({ name: "submissions" }),
  //router: connectRouter(history),
  metrics:{
    isMetricsLoading: true,
    submissionsList: [],
    submissionsStatusList: [],
    isMetricsStatusLoading: true,
    selectedMetricsId: 0,
    metricsLoadError: false,
    metricsStatusLoadError: false,
    // tasksCount:0,
    // taskDetail: {},
    // isTaskUpdating:false,
  },
  process:{
    isProcessLoading: true,
    processStatusList: [],
    processLoadError: false,
    processList: [],
    formProcessError: false,
    formProcessList: [],
    processActivityList: null,
    processDiagramXML: "",
    processActivityLoadError: false,
    isProcessDiagramLoading: true,
    formPreviousData:[],
  },
  menu:{
    isMenuOpen: false
  },
  formCheckList:{
    formList: [],
    formUploadFormList:[],
    formUploadCounter:0
  },
  formchecked:{
    isFormChecked: false,
    isAllFormChecked: false
  }
}
