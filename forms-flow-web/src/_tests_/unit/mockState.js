
export const mockstate = {

  process:{
    processList: [],
    isApplicationCountLoading: false
  },
  bpmForms:  {
    error: "",
    forms: [
      {
        _id: 'mock-form-id',        
        title: 'Test Form',
        description: 'Test Description',
        status: 'active',
      },
    ],
    isActive: false,
    limit: 5,
    page: 1,
    totalForms: 50,
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

  user:{
    createDesigns: true,  
    bearerToken: "",
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

