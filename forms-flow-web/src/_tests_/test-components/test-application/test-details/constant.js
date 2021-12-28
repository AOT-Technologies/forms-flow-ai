export const mockApplication1 = {
  id:1,
  applicationName: "Sample Form",
  applicationStatus: "Approved",
  created: "2021-10-07 10:00:07.980032",
  createdBy: "test-user",
  formId: "615d4097163a6c58ae2e667",
  formProcessMapperId: "2",
  formUrl: "http://localhost/form/615d4097163a6c58ae2e667/submission/615ec54b163a6cf1175f3456",
  modified: "2021-10-07 10:00:44.079736",
  modifiedBy: "test-user",
  processInstanceId: "5a37c2ff-2755-11ec-9906-0242ac1a1117",
  revisionNo: "1",
  submissionId: "615ec54b163a6cf1182e3456"
};

export const mockApplication2 = {
  id:2,
  applicationName: "Test Form",
  applicationStatus: "New",
  created: "2021-10-05 10:00:07.980032",
  createdBy: "test-user2",
  formId: "615d4097163a6c58ae2e111",
  formProcessMapperId: "3",
  formUrl: "http://localhost/form/615d4097163a6c58ae2e111/submission/615ec54b163a6cf1182e3222",
  modified: "2021-10-05 10:00:44.079736",
  modifiedBy: "test-user2",
  processInstanceId: "5a37c2ff-2755-11ec-9906-0242ac1a4444",
  revisionNo: "1",
  submissionId: "615ec54b163a6cf1182e3222"
};

export const applicationState = {
  applications:{
  applicationsList:[],
  applicationDetail: {},
  applicationProcess: {},
  formApplicationsList:[],
  isApplicationListLoading:false,
  isApplicationDetailLoading:false,
  isApplicationUpdating:false,
  applicationCount:0,
  applicationDetailStatusCode:''
 }
}
