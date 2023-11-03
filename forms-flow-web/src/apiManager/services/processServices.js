/* istanbul ignore file */
import { RequestService } from "@formsflow/service";
import API from "../endpoints";
import {
  setProcessStatusLoading,
  setProcessList,
  setProcessActivityLoadError,
  setProcessLoadError,
  setAllProcessList,
  setFormProcessesData,
  setFormProcessLoadError,
  setProcessActivityData,
  setProcessDiagramXML,
  setProcessDiagramLoading,
  setFormPreviosData,
  setApplicationCountResponse,
  setUnPublishApiError,
  setResetProcess,
  setAllDmnProcessList,
  setBpmnModel,
} from "../../actions/processActions";
import { setApplicationCount } from "../../actions/processActions";
import { replaceUrl } from "../../helper/helper";
import { StorageService } from "@formsflow/service";

import { toast } from "react-toastify";
import { Translation } from "react-i18next";
import { setFormStatusLoading } from "../../actions/processActions";
export const getProcessStatusList = (processId, taskId) => {
  return (dispatch) => {
    dispatch(setProcessStatusLoading(true));
    dispatch(setProcessLoadError(false));
    const apiUrlProcessId = replaceUrl(
      API.PROCESS_STATE,
      "<process_key>",
      processId
    );

    const apiURLWithtaskId = replaceUrl(apiUrlProcessId, "<task_key>", taskId);

    RequestService.httpGETRequest(apiURLWithtaskId)
      .then((res) => {
        if (res.data) {
          dispatch(setProcessStatusLoading(false));
          dispatch(setProcessLoadError(false));
          dispatch(setProcessList(res.data.status));
        } else {
          dispatch(setProcessStatusLoading(false));
          dispatch(setProcessList([]));
          dispatch(setProcessLoadError(true));
        }
      })
      // eslint-disable-next-line no-unused-vars
      .catch((error) => {
        dispatch(setProcessStatusLoading(false));
        dispatch(setProcessLoadError(true));
      });
  };
};

/**
 *
 * @param  {...any} rest
 */
export const fetchAllBpmProcesses = (  {tenant_key = null,
  firstResult,
  maxResults,
  searchKey,} = {},
  ...rest) => {
  const done = rest.length ? rest[0] : () => {};

  let url =
    API.GET_BPM_PROCESS_LIST +
    "?latestVersion=true" +
    "&excludeInternal=true" +
    "&includeProcessDefinitionsWithoutTenantId=true" +
    "&sortBy=tenantId" +
    "&sortOrder=asc";

  if (tenant_key) {
    url = url + "&tenantIdIn=" + tenant_key;
  }
  if (firstResult) {
    url = url + "&firstResult=" + firstResult;
  }
  if (maxResults) {
    url = url + "&maxResults=" + maxResults;
  }
  if (searchKey) {
    url = url + `&nameLike=%${searchKey}%`;
  }
  return (dispatch) => {
    // eslint-disable-next-line max-len
    RequestService.httpGETRequest(
      url,
      {},
      StorageService.get(StorageService.User.AUTH_TOKEN),
      true
    )
      .then((res) => {
        if (res?.data) {
          let unique = removeTenantDuplicates(res.data, tenant_key);
          dispatch(setProcessStatusLoading(false));
          dispatch(setAllProcessList(unique));
          done(null, res.data);
        } else {
          dispatch(setAllProcessList([]));
        }
      })
      // eslint-disable-next-line no-unused-vars
      .catch((error) => {
        console.log(error);
        dispatch(setProcessLoadError(true));
      });
  };
};

export const fetchAllBpmProcessesCount = (tenant_key,searchKey,) => {
  let url =
    API.GET_BPM_PROCESS_LIST_COUNT +
    "?latestVersion=true" + 
    "&includeProcessDefinitionsWithoutTenantId=true" +
    "&sortBy=tenantId" +
    "&sortOrder=asc";

  if (tenant_key) {
    url = url + "&tenantIdIn=" + tenant_key;
  }
  if(searchKey){
    url = url + `&nameLike=%${searchKey}%`;
  }

  return RequestService.httpGETRequest(
    url,
    {},
    StorageService.get(StorageService.User.AUTH_TOKEN),
    true
  );
};

export const fetchAllDmnProcesses = ({tenant_key = null,
  firstResult,
  maxResults,
  searchKey} = {},
  ...rest) => {
  const done = rest.length ? rest[0] : () => {};

  let url =
    API.GET_DMN_PROCESS_LIST +
    "?latestVersion=true" +
    "&includeDecisionDefinitionsWithoutTenantId=true" +
    "&sortBy=tenantId" +
    "&sortOrder=asc";

  if (tenant_key) {
    url = url + "&tenantIdIn=" + tenant_key;
  }
  if (firstResult) {
    url = url + "&firstResult=" + firstResult;
  }
  if (maxResults) {
    url = url + "&maxResults=" + maxResults;
  }
  if (searchKey) {
    url = url + `&resourceNameLike=%${searchKey}%`;
  }

  return (dispatch) => {
    // eslint-disable-next-line max-len
    RequestService.httpGETRequest(
      url,
      {},
      StorageService.get(StorageService.User.AUTH_TOKEN),
      true
    )
      .then((res) => {
        if (res?.data) {
          let unique = removeTenantDuplicates(res.data, tenant_key);
          dispatch(setAllDmnProcessList(unique));
          dispatch(setProcessStatusLoading(false));
          dispatch(setBpmnModel(false));
          done(null, res.data);
        } else {
          dispatch(setAllDmnProcessList([]));
        }
      })
      // eslint-disable-next-line no-unused-vars
      .catch((error) => {
        dispatch(setProcessLoadError(true));
      });
  };
};

const removeTenantDuplicates = (list, tenant_key) => {
  let seen = new Set();
  return list.filter((item) => {
    let key = item.key;
    if (item.tenantId != tenant_key && item.tenantId != null) return false;
    return seen.has(key) ? false : seen.add(key);
  });
};

/**
 *
 * @param  {...any} rest
 */
export const getFormProcesses = (formId, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    RequestService.httpGETRequest(
      `${API.FORM_PROCESSES}/${formId}`,
      {},
      StorageService.get(StorageService.User.AUTH_TOKEN),
      true
    )
      .then((res) => {
        if (res.data) {
          dispatch(setFormPreviosData(res.data));
          dispatch(setFormProcessesData(res.data));
          // need to check api and put exact respose
          done(null, res.data);
        } else {
          dispatch(setFormPreviosData([]));
          dispatch(setFormProcessesData([]));
          dispatch(setFormStatusLoading(false));
          dispatch(setProcessLoadError(true));
          done("no data", null);
        }
      })
      // eslint-disable-next-line no-unused-vars
      .catch((error) => {
        // dispatch(setProcessStatusLoading(false));
        dispatch(setFormProcessLoadError(true));
      });
  };
};

export const fetchAllDmnProcessesCount = (tenant_key = null, searchKey) => {
 

  let url =
    API.GET_DMN_PROCESS_LIST_COUNT +
    "?latestVersion=true" +
    "&includeDecisionDefinitionsWithoutTenantId=true" +
    "&sortBy=tenantId" +
    "&sortOrder=asc";

  if (tenant_key) {
    url = url + "&tenantIdIn=" + tenant_key;
  }
 
  if(searchKey){
    url = url + `&resourceNameLike=%${searchKey}%`;
  }

  return RequestService.httpGETRequest(
    url,
    {},
    StorageService.get(StorageService.User.AUTH_TOKEN),
    true
  );
};

export const getApplicationCount = (mapperId, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return async (dispatch) => {
    let apiUrlClaimTask = replaceUrl(
      API.GET_FORM_COUNT,
      "<mapper id>",
      mapperId
    );
    await RequestService.httpGETRequest(apiUrlClaimTask)
      .then((res) => {
        const applicationCount = +res.data?.value;
        dispatch(setApplicationCount(applicationCount));
        dispatch(setApplicationCountResponse(true));
        done(null, res);
      })
      // eslint-disable-next-line no-unused-vars
      .catch((error) => {
        // dispatch(setProcessStatusLoading(false));
        dispatch(setApplicationCount(0));
        dispatch(setApplicationCountResponse(true));
        done("no data", null);
      });
  };
};

export const getAllApplicationCount = (formId, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return async (dispatch) => {
    let apiUrlClaimTask = replaceUrl(
      API.GET_ALL_APPLICATIONS_COUNT_BY_FORM_ID,
      "<form id>",
      formId
    );
    await RequestService.httpGETRequest(apiUrlClaimTask)
      .then((res) => {
        const applicationCount = +res.data?.value;
        dispatch(setApplicationCount(applicationCount));
        dispatch(setApplicationCountResponse(true));
        done(null, res);
      })
      // eslint-disable-next-line no-unused-vars
      .catch((error) => {
        // dispatch(setProcessStatusLoading(false));
        dispatch(setApplicationCount(0));
        dispatch(setApplicationCountResponse(true));
        done("no data", null);
      });
  };
};

export const saveFormProcessMapperPost = (data, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return async (dispatch) => {
    RequestService.httpPOSTRequest(`${API.FORM}`, data)
      .then(async (res) => {
        if (res.data) {
          dispatch(getApplicationCount(res.data.id));
          dispatch(setFormProcessesData(res.data));
          dispatch(setFormPreviosData(res.data));
          done(null, res.data);
        } else {
          dispatch(setFormProcessesData([]));
          dispatch(setFormPreviosData([]));
          done(null, []);
        }
      })
      .catch((error) => {
        dispatch(getFormProcesses(data.formId));
        toast.error(
          <Translation>{(t) => t("Form process failed")}</Translation>
        );
        console.log("Error", error);
        dispatch(setFormProcessLoadError(true));
        done(error);
      });
  };
};

export const saveFormProcessMapperPut = (data, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return async (dispatch) => {
    RequestService.httpPUTRequest(`${API.FORM}/${data.id}`, data)
      .then(async (res) => {
        if (res.data) {
          dispatch(getApplicationCount(res.data.id));
          dispatch(setFormPreviosData(res.data));
          dispatch(setFormProcessesData(res.data));
          done(null, res.data);
        } else {
          dispatch(setFormProcessesData([]));
          dispatch(setFormPreviosData([]));
          done(null, []);
        }
      })
      .catch((error) => {
        dispatch(getFormProcesses(data.formId));
        dispatch(setFormProcessesData([]));
        toast.error(
          <Translation>{(t) => t("Form process failed")}</Translation>
        );
        console.log("Error", error);
        dispatch(setFormProcessLoadError(true));
        done(error);
      });
  };
};

/**
 *
 * @param  {...any} rest
 */
export const getProcessActivities = (process_instance_id, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const apiUrlProcessActivities = replaceUrl(
    API.PROCESS_ACTIVITIES,
    "<process_instance_id>",
    process_instance_id
  );
  return (dispatch) => {
    RequestService.httpGETRequest(
      apiUrlProcessActivities,
      {},
      StorageService.get(StorageService.User.AUTH_TOKEN),
      true
    )
      .then((res) => {
        if (res.data) {
          dispatch(setProcessActivityData(res.data.childActivityInstances));
          dispatch(setProcessActivityLoadError(false));
        } else {
          dispatch(setProcessActivityData(null));
          dispatch(setProcessActivityLoadError(true));
        }
        done(null, res.data);
      })
      .catch((error) => {
        done(error);
        dispatch(setProcessActivityData(null));
        dispatch(setProcessActivityLoadError(true));
      });
  };
};

export const fetchDiagram = (
  process_key,
  tenant_key = null,
  isDmn = false,
  ...rest
) => {
  const api = isDmn ? API.DMN_XML : API.PROCESSES_XML;

  let url = replaceUrl(api, "<process_key>", process_key);

  if (tenant_key) {
    url = url + `?tenantId=${tenant_key}`;
  }

  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    RequestService.httpGETRequest(
      url,
      {},
      StorageService.get(StorageService.User.AUTH_TOKEN),
      true
    )
      .then((res) => {
        if (res.data && (isDmn ? res.data.dmnXml : res.data.bpmn20Xml)) {
          dispatch(
            setProcessDiagramXML(isDmn ? res.data.dmnXml : res.data.bpmn20Xml)
          );
          
          // console.log('res.data.bpmn20Xml>>',res.data.bpmn20Xml);
        } else {
          dispatch(setProcessDiagramXML(""));
        }
        dispatch(setProcessDiagramLoading(false));
        done(null, res.data);
      })
      .catch((error) => {
        dispatch(setProcessDiagramXML(""));
        dispatch(setProcessDiagramLoading(false));
        done(error);
      });
  };
};

export const resetFormProcessData = () => {
  return (dispatch) => {
    dispatch(setResetProcess());
  };
};

export const unPublishForm = (mapperId, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const url = replaceUrl(API.UNPUBLISH_FORMS, "<mapper id>", mapperId);
  return (dispatch) => {
    RequestService.httpDELETERequest(url)
      .then((res) => {
        dispatch(resetFormProcessData());
        done(null, res.data);
      })
      .catch((error) => {
        console.log("error", error);
        dispatch(setUnPublishApiError(true));
        done(error);
      });
  };
};

export const deleteFormProcessMapper = (mapperId, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const url = replaceUrl(API.UNPUBLISH_FORMS, "<mapper id>", mapperId);
  return (dispatch) => {
    RequestService.httpDELETERequest(url)
      .then((res) => {
        done(null, res.data);
      })
      .catch((error) => {
        console.log("error", error);
        dispatch(setUnPublishApiError(true));
        done(error);
      });
  };
};
