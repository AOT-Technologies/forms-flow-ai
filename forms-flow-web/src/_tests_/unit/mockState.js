import { create } from "lodash";
import applications from "../../modules/applicationsReducer";

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
    totalBpmnCount:50,
    totalDmnCount:50,
    bpmsort: {
      activeKey: "name",
      name: { sortOrder: "asc" },
      processKey: { sortOrder: "asc" },
      modified: { sortOrder: "asc" },
      status: { sortOrder: "asc" },
   },
   dmnSort: {
      activeKey: "processKey",
      name: { sortOrder: "asc" },
      processKey: { sortOrder: "asc" },
      modified: { sortOrder: "asc" },
      status: { sortOrder: "asc" },
   },
    processData: {
      name: "Test Process",
      status: "Published",
      processData: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<bpmn:definitions xmlns:bpmn=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:dc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:di=\"http://www.omg.org/spec/DD/20100524/DI\" xmlns:modeler=\"http://camunda.org/schema/modeler/1.0\" id=\"Definitions_49a3inm\" targetNamespace=\"http://bpmn.io/schema/bpmn\" exporter=\"Camunda Modeler\" exporterVersion=\"5.0.0\" modeler:executionPlatform=\"Camunda Platform\" modeler:executionPlatformVersion=\"7.17.0\">\n  <bpmn:process id=\"Process_nm9ewcsAAQQQ\" name=\"AAA123 asdfas fasdfasdfasdf asdf\" isExecutable=\"true\">\n    <bpmn:startEvent id=\"StartEvent_1\" name=\"AAA\">\n      <bpmn:outgoing>Flow_09jopgd</bpmn:outgoing>\n    </bpmn:startEvent>\n    <bpmn:task id=\"Activity_18u6he3\" name=\"gsdfgf\">\n      <bpmn:incoming>Flow_09jopgd</bpmn:incoming>\n      <bpmn:outgoing>Flow_18bc6ut</bpmn:outgoing>\n    </bpmn:task>\n    <bpmn:sequenceFlow id=\"Flow_09jopgd\" sourceRef=\"StartEvent_1\" targetRef=\"Activity_18u6he3\" />\n    <bpmn:endEvent id=\"Event_02oforr\" name=\"ssaas\">\n      <bpmn:incoming>Flow_18bc6ut</bpmn:incoming>\n    </bpmn:endEvent>\n    <bpmn:sequenceFlow id=\"Flow_18bc6ut\" sourceRef=\"Activity_18u6he3\" targetRef=\"Event_02oforr\" />\n  </bpmn:process>\n  <bpmndi:BPMNDiagram id=\"BPMNDiagram_1\">\n    <bpmndi:BPMNPlane id=\"BPMNPlane_1\" bpmnElement=\"Process_nm9ewcsAAQQQ\">\n      <bpmndi:BPMNShape id=\"_BPMNShape_StartEvent_2\" bpmnElement=\"StartEvent_1\">\n        <dc:Bounds x=\"179\" y=\"159\" width=\"36\" height=\"36\" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x=\"186\" y=\"202\" width=\"22\" height=\"14\" />\n        </bpmndi:BPMNLabel>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"Event_02oforr_di\" bpmnElement=\"Event_02oforr\">\n        <dc:Bounds x=\"542\" y=\"142\" width=\"36\" height=\"36\" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x=\"547\" y=\"185\" width=\"29\" height=\"14\" />\n        </bpmndi:BPMNLabel>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"Activity_18u6he3_di\" bpmnElement=\"Activity_18u6he3\">\n        <dc:Bounds x=\"300\" y=\"180\" width=\"100\" height=\"80\" />\n        <bpmndi:BPMNLabel />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNEdge id=\"Flow_09jopgd_di\" bpmnElement=\"Flow_09jopgd\">\n        <di:waypoint x=\"215\" y=\"177\" />\n        <di:waypoint x=\"243\" y=\"177\" />\n        <di:waypoint x=\"243\" y=\"220\" />\n        <di:waypoint x=\"300\" y=\"220\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"Flow_18bc6ut_di\" bpmnElement=\"Flow_18bc6ut\">\n        <di:waypoint x=\"400\" y=\"220\" />\n        <di:waypoint x=\"431\" y=\"220\" />\n        <di:waypoint x=\"431\" y=\"160\" />\n        <di:waypoint x=\"542\" y=\"160\" />\n      </bpmndi:BPMNEdge>\n    </bpmndi:BPMNPlane>\n  </bpmndi:BPMNDiagram>\n</bpmn:definitions>\n"
    },
    defaultProcessXmlData: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<bpmn:definitions xmlns:bpmn=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:dc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:di=\"http://www.omg.org/spec/DD/20100524/DI\" xmlns:modeler=\"http://camunda.org/schema/modeler/1.0\" id=\"Definitions_49a3inm\" targetNamespace=\"http://bpmn.io/schema/bpmn\" exporter=\"Camunda Modeler\" exporterVersion=\"5.0.0\" modeler:executionPlatform=\"Camunda Platform\" modeler:executionPlatformVersion=\"7.17.0\">\n  <bpmn:process id=\"Process_nm9ewcsAAQQQ\" name=\"AAA123 asdfas fasdfasdfasdf asdf\" isExecutable=\"true\">\n    <bpmn:startEvent id=\"StartEvent_1\" name=\"AAA\">\n      <bpmn:outgoing>Flow_09jopgd</bpmn:outgoing>\n    </bpmn:startEvent>\n    <bpmn:task id=\"Activity_18u6he3\" name=\"gsdfgf\">\n      <bpmn:incoming>Flow_09jopgd</bpmn:incoming>\n      <bpmn:outgoing>Flow_18bc6ut</bpmn:outgoing>\n    </bpmn:task>\n    <bpmn:sequenceFlow id=\"Flow_09jopgd\" sourceRef=\"StartEvent_1\" targetRef=\"Activity_18u6he3\" />\n    <bpmn:endEvent id=\"Event_02oforr\" name=\"ssaas\">\n      <bpmn:incoming>Flow_18bc6ut</bpmn:incoming>\n    </bpmn:endEvent>\n    <bpmn:sequenceFlow id=\"Flow_18bc6ut\" sourceRef=\"Activity_18u6he3\" targetRef=\"Event_02oforr\" />\n  </bpmn:process>\n  <bpmndi:BPMNDiagram id=\"BPMNDiagram_1\">\n    <bpmndi:BPMNPlane id=\"BPMNPlane_1\" bpmnElement=\"Process_nm9ewcsAAQQQ\">\n      <bpmndi:BPMNShape id=\"_BPMNShape_StartEvent_2\" bpmnElement=\"StartEvent_1\">\n        <dc:Bounds x=\"179\" y=\"159\" width=\"36\" height=\"36\" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x=\"186\" y=\"202\" width=\"22\" height=\"14\" />\n        </bpmndi:BPMNLabel>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"Event_02oforr_di\" bpmnElement=\"Event_02oforr\">\n        <dc:Bounds x=\"542\" y=\"142\" width=\"36\" height=\"36\" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x=\"547\" y=\"185\" width=\"29\" height=\"14\" />\n        </bpmndi:BPMNLabel>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"Activity_18u6he3_di\" bpmnElement=\"Activity_18u6he3\">\n        <dc:Bounds x=\"300\" y=\"180\" width=\"100\" height=\"80\" />\n        <bpmndi:BPMNLabel />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNEdge id=\"Flow_09jopgd_di\" bpmnElement=\"Flow_09jopgd\">\n        <di:waypoint x=\"215\" y=\"177\" />\n        <di:waypoint x=\"243\" y=\"177\" />\n        <di:waypoint x=\"243\" y=\"220\" />\n        <di:waypoint x=\"300\" y=\"220\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"Flow_18bc6ut_di\" bpmnElement=\"Flow_18bc6ut\">\n        <di:waypoint x=\"400\" y=\"220\" />\n        <di:waypoint x=\"431\" y=\"220\" />\n        <di:waypoint x=\"431\" y=\"160\" />\n        <di:waypoint x=\"542\" y=\"160\" />\n      </bpmndi:BPMNEdge>\n    </bpmndi:BPMNPlane>\n  </bpmndi:BPMNDiagram>\n</bpmn:definitions>\n",
    defaultDmnXmlData: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<bpmn:definitions xmlns:bpmn=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:dc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:di=\"http://www.omg.org/spec/DD/20100524/DI\" xmlns:modeler=\"http://camunda.org/schema/modeler/1.0\" id=\"Definitions_49a3inm\" targetNamespace=\"http://bpmn.io/schema/bpmn\" exporter=\"Camunda Modeler\" exporterVersion=\"5.0.0\" modeler:executionPlatform=\"Camunda Platform\" modeler:executionPlatformVersion=\"7.17.0\">\n  <bpmn:process id=\"Process_nm9ewcsAAQQQ\" name=\"AAA123 asdfas fasdfasdfasdf asdf\" isExecutable=\"true\">\n    <bpmn:startEvent id=\"StartEvent_1\" name=\"AAA\">\n      <bpmn:outgoing>Flow_09jopgd</bpmn:outgoing>\n    </bpmn:startEvent>\n    <bpmn:task id=\"Activity_18u6he3\" name=\"gsdfgf\">\n      <bpmn:incoming>Flow_09jopgd</bpmn:incoming>\n      <bpmn:outgoing>Flow_18bc6ut</bpmn:outgoing>\n    </bpmn:task>\n    <bpmn:sequenceFlow id=\"Flow_09jopgd\" sourceRef=\"StartEvent_1\" targetRef=\"Activity_18u6he3\" />\n    <bpmn:endEvent id=\"Event_02oforr\" name=\"ssaas\">\n      <bpmn:incoming>Flow_18bc6ut</bpmn:incoming>\n    </bpmn:endEvent>\n    <bpmn:sequenceFlow id=\"Flow_18bc6ut\" sourceRef=\"Activity_18u6he3\" targetRef=\"Event_02oforr\" />\n  </bpmn:process>\n  <bpmndi:BPMNDiagram id=\"BPMNDiagram_1\">\n    <bpmndi:BPMNPlane id=\"BPMNPlane_1\" bpmnElement=\"Process_nm9ewcsAAQQQ\">\n      <bpmndi:BPMNShape id=\"_BPMNShape_StartEvent_2\" bpmnElement=\"StartEvent_1\">\n        <dc:Bounds x=\"179\" y=\"159\" width=\"36\" height=\"36\" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x=\"186\" y=\"202\" width=\"22\" height=\"14\" />\n        </bpmndi:BPMNLabel>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"Event_02oforr_di\" bpmnElement=\"Event_02oforr\">\n        <dc:Bounds x=\"542\" y=\"142\" width=\"36\" height=\"36\" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x=\"547\" y=\"185\" width=\"29\" height=\"14\" />\n        </bpmndi:BPMNLabel>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"Activity_18u6he3_di\" bpmnElement=\"Activity_18u6he3\">\n        <dc:Bounds x=\"300\" y=\"180\" width=\"100\" height=\"80\" />\n        <bpmndi:BPMNLabel />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNEdge id=\"Flow_09jopgd_di\" bpmnElement=\"Flow_09jopgd\">\n        <di:waypoint x=\"215\" y=\"177\" />\n        <di:waypoint x=\"243\" y=\"177\" />\n        <di:waypoint x=\"243\" y=\"220\" />\n        <di:waypoint x=\"300\" y=\"220\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"Flow_18bc6ut_di\" bpmnElement=\"Flow_18bc6ut\">\n        <di:waypoint x=\"400\" y=\"220\" />\n        <di:waypoint x=\"431\" y=\"220\" />\n        <di:waypoint x=\"431\" y=\"160\" />\n        <di:waypoint x=\"542\" y=\"160\" />\n      </bpmndi:BPMNEdge>\n    </bpmndi:BPMNPlane>\n  </bpmndi:BPMNDiagram>\n</bpmn:definitions>\n"
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
      submissions: { sortOrder: "asc" },
      visibility: { sortOrder: "asc"},
      status: { sortOrder: "asc" },
    },
    clientFormSearch:"",
  },

  user:{
    createDesigns: true,
    viewSubmissions: true,
    createSubmissions: true,
    showApplications: true,
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
    isAuthenticated: true,
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
  },
  customSubmission:{
    submission:{
      data:{}
    }
  },
  applications: {
    isApplicationDataLoading: true,
    isApplicationDetailLoading: false,
    applicationData: {},
    applicationDetail: {
      applicationName: "BusinessNew",
    },
    applicationId: ""
  }
};
