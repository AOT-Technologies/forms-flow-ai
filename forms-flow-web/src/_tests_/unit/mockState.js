
export const mockstate = {

  process:{
    isProcessLoading: true,
    processStatusList: [],
    processLoadError: false,
    processXml: "",
    processList: [
      {
        "created": "2025-02-10T09:01:11.971172Z",
        "modified": "2025-02-10T09:01:11.971190Z",
        "id": 4676,
        "name": "AAA123 asdfas fasdfasdfasdf asdf",
        "tenant": null,
        "createdBy": "formsflow-designer",
        "modifiedBy": null,
        "status": "Published",
        "processType": "BPMN",
        "isSubflow": true,
        "processKey": "Process_nm9ewcsAAQQQ",
        "parentProcessKey": "Process_nm9ewcsAAQQQ"
    }
    ],
    dmnProcessList: [{
      "created": "2025-02-10T09:00:27.522600Z",
      "modified": "2025-02-10T09:00:27.522617Z",
      "id": 4674,
      "name": "abilaaadddghaagccalexaaaffcxdfvdff",
      "tenant": null,
      "createdBy": "formsflow-designer",
      "modifiedBy": null,
      "status": "Draft",
      "processType": "DMN",
      "isSubflow": true,
      "processKey": "abddddlsghaafdantonydsfcvgf",
      "parentProcessKey": "ablsghaafdantonydsfcvgf"
  }],
    formProcessError: false,
    formProcessList: [],
    formPreviousData: [],
    processActivityList: null,
    processActivityLoadError: false,
    isProcessDiagramLoading: false,
    applicationCount: 0,
    isApplicationCountLoading: false,
    applicationCountResponse: false,
    unPublishApiError: false,
    workflowAssociated: null, //{label:'Workflow Name', value:'workflow_process_key'}
    formStatusLoading: false,
    authorizationDetails: {},
    formAuthVerifyLoading: false,
    isBpmnModel: false,
    bpmnSearchText: "",
    dmnSearchText: "",
    isPublicDiagram: null,
    processHistoryData:{},
    processData:{},
    totalBpmnCount:50,
    totalDmnCount:50,
    defaultProcessXmlData:<xml></xml>,
    defaultDmnXmlData:<xml></xml>,
    bpmsort: {
      activeKey: "name",
      name: { sortOrder: "asc" },
      processKey: { sortOrder: "asc" },
      modified: { sortOrder: "asc" },
      status: { sortOrder: "asc" },
   },
   dmnSort: {
      activeKey: "name",
      name: { sortOrder: "asc" },
      processKey: { sortOrder: "asc" },
      modified: { sortOrder: "asc" },
      status: { sortOrder: "asc" },
   }
   
  },
  bpmForms:  {
    error: "",
    forms: [
      {
        _id: 'some-form-id',
        title: 'Test Form',
        description: 'Test Description',
        status: 'active',
      },
    ],
    isActive: false,
    limit: 5,
    page: 1,
    totalForms: 0,
    bpmFormLoading: false,
    sortBy: "formName",
    sortOrder: "asc",
    formType:"form",
    searchText: "",
    sort: {
      activeKey: "formName", 
      formName: { sortOrder: "asc" },
      modified: { sortOrder: "asc" },
      visibility: { sortOrder: "asc"},
      status: { sortOrder: "asc" },
    },
    clientFormSearch:"",
  },

  user:{bearerToken: "",
    roles: [
    "view_tasks",
    "formsflow-client",
    "create_bpmn_flows",
    "manage_all_filters",
    "formsflow-reviewer",
    "manage_integrations",
    "view_dashboards",
    "create_submissions",
    "admin",
    "manage_decision_tables",
    "view_designs",
    "view_submissions",
    "manage_roles",
    "manage_dashboard_authorizations",
    "create_designs",
    "formsflow-admin",
    "manage_users",
    "manage_tasks",
    "view_filters",
    "formsflow-analytics",
    "create_filters",
    "formsflow-designer",
    "manage_subflows"
],
    roleIds: {
      "DESIGNER": "65f684595a0b7bdb4eabddb3",
      "ANONYMOUS": "65f6845a5a0b7bdb4eabddca",
      "CLIENT": "65f6845c5a0b7bdb4eabddda",
      "REVIEWER": "65f6845b5a0b7bdb4eabddd4",
      "RESOURCE_ID": "65f6845c5a0b7bdb4eabdde1"
  },
    userDetail: {},
    isAuthenticated: false,
    currentPage: "",
    showApplications: false,
    lang: localStorage.getItem("lang") ? localStorage.getItem("lang") : null,
    selectLanguages: [],
    defaultFilter: "",
    searchText: ''
  },

  tenants: {
    isTenantDataLoading: true,
    isTenantDetailLoading: false,
    tenantData: {},
    tenantDetail: null,
    tenantId: ""
  },

  formCheckList: {
    formList: [],
    formUploadFormList: [],
    formUploadCounter: 0,
    formUploadFailureCounter: 0,
    designerFormLoading: false,
    searchFormLoading: false,
    designerAccessDenied: false
  },
  formDelete: { 
    formDelete: { modalOpen: false, formId: "", formName: "" }
  }

 

};

