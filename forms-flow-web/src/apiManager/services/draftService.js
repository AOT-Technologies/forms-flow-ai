import {
  httpGETRequest,
  httpPOSTRequest,
  httpPOSTRequestWithoutToken,
  httpPUTRequest,
  httpPUTRequestWithoutToken,
} from "../httpRequestHandler";
import API from "../endpoints";
import { replaceUrl } from "../../helper/helper";
import {
  setDraftlist,
  setDraftSubmission,
  setDraftDetail,
  setDraftCount,
  setDraftSubmissionError,
  setDraftDetailStatusCode,
  saveLastUpdatedDraft,
} from "../../actions/draftActions";
import moment from "moment";
import { setApplicationListCount } from "../../actions/applicationActions";

export const draftCreate = (data, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const URL = API.DRAFT_BASE;
  return (dispatch) => {
    httpPOSTRequest(URL, data)
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
  const draftId = rest.length ? rest[0] : null;
  const done = draftId && rest.length > 1 ? rest[1] : () => {};
  const URL = replaceUrl(API.DRAFT_UPDATE, "<draft_id>", draftId);
  return (dispatch) => {
    httpPUTRequest(URL, data)
      .then((res) => {
        if (res.data) {
          done(null, res.data);
          dispatch(saveLastUpdatedDraft({ ...data }));
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
  const draftId = rest.length ? rest[0] : null;
  const done = draftId && rest.length > 1 ? rest[1] : () => {};
  const URL = replaceUrl(API.DRAFT_APPLICATION_CREATE, "<draft_id>", draftId);
  return () => {
    httpPUTRequest(URL, data)
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
  const done = rest.length ? rest[0] : () => {};
  const URL = API.DRAFT_PUBLIC_CREATE;
  return (dispatch) => {
    httpPOSTRequestWithoutToken(URL, data)
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
  const draftId = rest.length ? rest[0] : null;
  const done = draftId && rest.length > 1 ? rest[1] : () => {};
  const URL = replaceUrl(API.DRAFT_UPDATE_PUBLIC, "<draft_id>", draftId);
  return (dispatch) => {
    httpPUTRequestWithoutToken(URL, data)
      .then((res) => {
        if (res.data) {
          done(null, res.data);
          dispatch(saveLastUpdatedDraft({ ...data }));
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
  const draftId = rest.length ? rest[0] : null;
  const done = draftId && rest.length > 1 ? rest[1] : () => {};
  const URL = replaceUrl(
    API.DRAFT_APPLICATION_CREATE_PUBLIC,
    "<draft_id>",
    draftId
  );
  return () => {
    httpPUTRequestWithoutToken(URL, data)
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

export const fetchDrafts = (pageNo = 1, limit = 5, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const URL = `${API.DRAFT_BASE}?pageNo=${pageNo}&limit=${limit}&sortBy=id&sortOrder=desc`;
  return (dispatch) => {
    httpGETRequest(URL)
      .then((res) => {
        if (res.data) {
          dispatch(setDraftlist(res.data.drafts));
          dispatch(setDraftCount(res.data?.totalCount || 0));
          dispatch(setApplicationListCount(res.data?.applicationCount || 0));
        } else {
          done("Error fetching data");
        }
      })
      .catch((error) => {
        done(error);
      });
  };
};

export const getDraftById = (draftId, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const apiUrlgetDraft = `${API.DRAFT_BASE}/${draftId}`;
  return (dispatch) => {
    httpGETRequest(apiUrlgetDraft)
      .then((res) => {
        if (res.data && Object.keys(res.data).length) {
          const draft = res.data;
          // const processData = getFormattedProcess(application);
          dispatch(setDraftDetail(draft));
          // dispatch(setApplicationProcess(processData));
          dispatch(setDraftDetailStatusCode(res.status));
          done(null, draft);
        } else {
          // dispatch(serviceActionError(res));
          dispatch(setDraftDetail({}));
          dispatch(setDraftDetailStatusCode(403));
          done("No data");
          // dispatch(setDraftDetailLoader(false));
        }
        done(null, res.data);
        // dispatch(setDraftDetailLoader(false));
      })
      .catch((error) => {
        console.log("Error", error);
        // dispatch(serviceActionError(error));
        dispatch(setDraftDetail({}));
        dispatch(setDraftDetailStatusCode(403));
        done(error);
        // dispatch(setDraftDetailLoader(false));
      });
  };
};

// Draft filter handler
export const FilterDrafts = (params, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    const { DraftName, id, modified } = params.filters;
    let url = `${API.DRAFT_BASE}?pageNo=${params.page}&limit=${params.sizePerPage}`;
    if (DraftName && DraftName !== "") {
      url += `&DraftName=${DraftName?.filterVal}`;
    }
    if (id && id !== "") {
      url += `&id=${id.filterVal}`;
    }

    if (modified && modified?.filterVal?.length === 2) {
      let modifiedFrom = moment
        .utc(modified.filterVal[0])
        .format("YYYY-MM-DDTHH:mm:ssZ")
        .replace("+", "%2B");
      let modifiedTo = moment
        .utc(modified.filterVal[1])
        .format("YYYY-MM-DDTHH:mm:ssZ")
        .replace("+", "%2B");
      url += `&modifiedFrom=${modifiedFrom}&modifiedTo=${modifiedTo}`;
    }

    if (params.sortField !== null) {
      url += `&sortBy=${params.sortField}&sortOrder=${params.sortOrder}`;
    }

    httpGETRequest(url)
      .then((res) => {
        if (res.data) {
          const drafts = res.data.drafts || [];
          dispatch(setDraftCount(res.data.totalCount || 0));
          dispatch(setDraftlist(drafts));
          done(null, drafts);
        } else {
          // dispatch(serviceActionError(res));
        }
        done(null, res.data);
      })
      .catch((error) => {
        // dispatch(serviceActionError(error));
        done(error);
      });
  };
};
