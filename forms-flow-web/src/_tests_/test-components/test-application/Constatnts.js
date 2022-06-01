export const ApplicationLists = [
  {
    applicationName: "New Business License Application",
    applicationStatus: "New",
    created: "2021-11-24 10:10:14.728215",
    createdBy: "john.honai",
    formId: "6180c59a9006028298bc7e50",
    formProcessMapperId: "22",
    formUrl:
      "https://app2.aot-technologies.com/form/6180c59a9006028298bc7e50/submission/619e0f8555ab3d622cae7044",
    id: 5435,
    isClientEdit: false,
    modified: "2021-11-24 10:10:15.283969",
    modifiedBy: "service-account-forms-flow-bpm",
    processInstanceId: null,
    revisionNo: "1",
    submissionId: "619e0f8555ab3d622cae7044",
  },
  {
    applicationName: "New Business License Application",
    applicationStatus: "New",
    created: "2021-11-24 10:09:21.869878",
    createdBy: "john.honai",
    formId: "6180c59a9006028298bc7e50",
    formProcessMapperId: "22",
    formUrl:
      "https://app2.aot-technologies.com/form/6180c59a9006028298bc7e50/submission/619e0f8555ab3d622cae7044",
    id: 5434,
    isClientEdit: false,
    modified: "2021-11-24 10:10:15.283969",
    modifiedBy: "service-account-forms-flow-bpm",
    processInstanceId: "982b2dae-4d0e-11ec-9925-0242ac150007",
    revisionNo: "1",
    submissionId: "619e0f5055ab3d5a35ae7041",
  },
  {
    applicationName: "New Business License Application",
    applicationStatus: "New",
    created: "2021-11-24 10:10:14.728215",
    createdBy: "john.honai",
    formId: "6180c598900602d814bc7e4f",
    formProcessMapperId: "22",
    formUrl:
      "https://app2.aot-technologies.com/form/6180c59a9006028298bc7e50/submission/619e0f8555ab3d622cae7044",
    id: 5433,
    isClientEdit: false,
    modified: "2021-11-24 10:10:15.283969",
    modifiedBy: "service-account-forms-flow-bpm",
    processInstanceId: "714cec02-4d0e-11ec-9925-0242ac150007",
    revisionNo: "1",
    submissionId: "619e2ef055ab3db43aae7049",
  },
];

export const applicationStatus = [
  "Approved",
  "New",
  "Rejected",
  "Resubmit",
  "Reviewed",
];

export const Loadingstate = {
  applicationsList: [],
  applicationDetail: {},
  applicationProcess: {},
  formApplicationsList: [],
  isApplicationListLoading: true,
  isApplicationDetailLoading: false,
  isApplicationUpdating: false,
  applicationCount: 0,
  applicationDetailStatusCode: "",
  activePage: 1,
  isFilterOn: false,
  countPerPage: 5,
};

export const AfterLoadingWithresult = {
  applicationsList: ApplicationLists,
  applicationDetail: {},
  applicationProcess: {},
  formApplicationsList: [],
  isApplicationListLoading: false,
  isApplicationDetailLoading: false,
  isApplicationUpdating: false,
  applicationCount: 3,
  applicationDetailStatusCode: "",
  activePage: 1,
  countPerPage: 5,
  applicationStatus: applicationStatus,
};
export const AfterLoadingWithoutresult = {
  applicationsList: [],
  applicationDetail: {},
  applicationProcess: {},
  formApplicationsList: [],
  isApplicationListLoading: false,
  isApplicationDetailLoading: false,
  isApplicationUpdating: false,
  applicationCount: 0,
  applicationDetailStatusCode: "",
  activePage: 1,
  countPerPage: 5,
  applicationStatus: [],
};

const applicationDetails = {
  applicationName: "NCQ",
  applicationStatus: "New",
  created: "2021-12-03 04:49:18.813383",
  createdBy: "sumathi",
  formId: "61a6fc8b5e9ef2746ba7c515",
  formProcessMapperId: "34",
  formUrl:
    "https://app2.aot-technologies.com/form/61a6fc8b5e9ef2746ba7c515/submission/61a9a1cd69193afa9fd819a6",
  id: 5487,
  modified: "2021-12-03 04:49:19.864880",
  modifiedBy: "service-account-forms-flow-bpm",
  processInstanceId: "5ffc2b46-53f4-11ec-81c8-0242ac170007",
  revisionNo: "1",
  submissionId: "61a9a1cd69193afa9fd819a6",
};

const applicationProcess = {
  id: "34",
  processKey: "onestepapproval",
  processName: "One Step Approval",
};
export const AfterLoadingApplicationDetailt = {
  applicationsList: [],
  applicationDetail: applicationDetails,
  applicationProcess: applicationProcess,
  formApplicationsList: [],
  isApplicationListLoading: false,
  isApplicationDetailLoading: false,
  isApplicationUpdating: false,
  applicationCount: 0,
  applicationDetailStatusCode: "",
  activePage: 1,
  countPerPage: 5,
  applicationStatus: [],
};
