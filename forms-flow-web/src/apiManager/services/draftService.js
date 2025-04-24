import { RequestService } from "@formsflow/service";
import API from "../endpoints";
import { replaceUrl } from "../../helper/helper";
import {
  setDraftlist,
  setDraftSubmission,
  setDraftDetail,
  setDraftCount,
  setDraftSubmissionError,
  setDraftDetailStatusCode,
  setDraftModified
} from "../../actions/draftActions";
import moment from "moment";

export const draftCreate = (data, ...rest) => {
  const done = rest.length ? rest[0] : () => { };
  const URL = API.DRAFT_BASE;
  return (dispatch) => {
    RequestService.httpPOSTRequest(URL, data)
      .then((res) => {
        if (res.data) {
          dispatch(setDraftSubmission(res.data));
          done(true);
        } else {
          dispatch(setDraftSubmissionError("Error Posting data"));
          done(false);
        }
      })
      .catch((error) => {
        dispatch(setDraftSubmissionError(error));
        done(false);
      });
  };
};

export const draftUpdate = (data, ...rest) => {
  const applicationId = rest.length ? rest[0] : null;
  const done = applicationId && rest.length > 1 ? rest[1] : () => { };
  const URL = replaceUrl(API.DRAFT_UPDATE, "<application_id>", applicationId);
  return (dispatch) => {
    RequestService.httpPUTRequest(URL, data)
      .then((res) => {
        if (res.data) {
          done(null, res.data);
          dispatch(setDraftModified(res.data));
          dispatch(setDraftSubmission(res.data)); 
        } else {
          done("Error Posting data");
        }
      })
      .catch((error) => {
        done(error);
      });
  };
};

export const draftSubmit = (data, ...rest) => {
  const applicationId = rest.length ? rest[0] : null;
  const done = applicationId && rest.length > 1 ? rest[1] : () => { };
  const URL = replaceUrl(API.DRAFT_APPLICATION_CREATE, "<application_id>", applicationId);
  return () => {
    RequestService.httpPUTRequest(URL, data)
      .then((res) => {
        if (res.data) {
          done(null, res.data);
        } else {
          done("Error Posting data");
        }
      })
      .catch((error) => {
        done(error);
      });
  };
};

export const publicDraftCreate = (data, ...rest) => {
  const done = rest.length ? rest[0] : () => { };
  const URL = API.DRAFT_PUBLIC_CREATE;
  return (dispatch) => {
    RequestService.httpPOSTRequestWithoutToken(URL, data)
      .then((res) => {
        if (res.data) {
          dispatch(setDraftSubmission(res.data));
          done(true);
        } else {
          dispatch(setDraftSubmissionError("Error Posting data"));
          done(false);
        }
      })
      .catch((error) => {
        dispatch(setDraftSubmissionError(error));
        done(false);
      });
  };
};

export const publicDraftUpdate = (data, ...rest) => {
  const applicationId = rest.length ? rest[0] : null;
  const done = applicationId && rest.length > 1 ? rest[1] : () => { };
  const URL = replaceUrl(API.DRAFT_UPDATE_PUBLIC, "<application_id>", applicationId);
  return (dispatch) => {
    RequestService.httpPUTRequestWithoutToken(URL, data)
      .then((res) => {
        if (res.data) {
          done(null, res.data);
          dispatch(setDraftSubmission(res.data)); 
        } else {
          done("Error Posting data");
        }
      })
      .catch((error) => {
        done(error);
      });
  };
};

export const publicDraftSubmit = (data, ...rest) => {
  const applicationId = rest.length ? rest[0] : null;
  const done = applicationId && rest.length > 1 ? rest[1] : () => { };
  const URL = replaceUrl(
    API.DRAFT_APPLICATION_CREATE_PUBLIC,
    "<application_id>",
    applicationId
  );
  return () => {
    RequestService.httpPUTRequestWithoutToken(URL, data)
      .then((res) => {
        if (res.data) {
          done(null, res.data);
        } else {
          done("Error Posting data");
        }
      })
      .catch((error) => {
        done(error);
      });
  };
};


export const getDraftById = (draftId, ...rest) => {
  const done = rest.length ? rest[0] : () => { };
  const apiUrlgetDraft = `${API.APPLICATION_DRAFT_API}/${draftId}`;
  return (dispatch) => {
    RequestService.httpGETRequest(apiUrlgetDraft)
      .then((res) => {
        if (res.data && Object.keys(res.data).length) {
          const draft = res.data;
          dispatch(setDraftDetail(draft));
          dispatch(setDraftModified(draft));
          dispatch(setDraftDetailStatusCode(res.status));
          done(null, draft);
        } else {
          dispatch(setDraftDetail({}));
          dispatch(setDraftDetailStatusCode(403));
          done("No data");
        }
        done(null, res.data);
      })
      .catch((error) => {
        console.log("Error", error);
        dispatch(setDraftDetail({}));
        dispatch(setDraftDetailStatusCode(403));
        done(error);
      });
  };
};

// Draft filter handler
export const fetchDrafts = (params, ...rest) => {
  const done = rest.length ? rest[0] : () => { };
  return (dispatch) => {
    const { draftName, id, modified } = params;
    let url = `${API.DRAFT_BASE}?pageNo=${params.page}&limit=${params.limit}`;
    if (draftName) {
      url += `&DraftName=${draftName}`;
    }
    if (id) {
      url += `&id=${id}`;
    }

    if (modified && modified.length === 2) {
      let modifiedFrom = moment
        .utc(modified[0])
        .format("YYYY-MM-DDTHH:mm:ssZ")
        .replace(/\+/g, "%2B");
      let modifiedTo = moment
        .utc(modified[1])
        .format("YYYY-MM-DDTHH:mm:ssZ")
        .replace(/\+/g, "%2B");
      url += `&modifiedFrom=${modifiedFrom}&modifiedTo=${modifiedTo}`;
    }

    if (params.sortBy !== null) {
      url += `&sortBy=${params.sortBy}&sortOrder=${params.sortOrder}`;
    }

    RequestService.httpGETRequest(url)
      .then((res) => {
        if (res.data) {
          const drafts = res.data.drafts || [];
          dispatch(setDraftCount(res.data.totalCount || 0));
          dispatch(setDraftlist(drafts));
          done(null, drafts);
        } else {
          done(null, res.data);
        }

      })
      .catch((error) => {
        dispatch(setDraftCount(0));
        dispatch(setDraftlist([]));
        done(error);
      });
  };
};

export const deleteDraftbyId = (applicationId) => {
  let url = `${API.APPLICATION_DRAFT_API}/${applicationId}`;
  return RequestService.httpDELETERequest(url);
};
