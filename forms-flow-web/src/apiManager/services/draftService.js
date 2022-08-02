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
} from "../../actions/draftActions";

export const draftCreate = (data, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const URL = API.DRAFT_BASE;
  return (dispatch) => {
    httpPOSTRequest(URL, data)
      .then((res) => {
        if (res.data) {
          dispatch(setDraftSubmission(res.data));
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

export const draftUpdate = (data, ...rest) => {
  const draftId = rest.length ? rest[0] : null;
  const done = draftId && rest.length > 1 ? rest[1] : () => {};
  const URL = replaceUrl(API.DRAFT_UPDATE, "<draft_id>", draftId);
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

export const publicDraftUpdate = (data, ...rest) => {
  const draftId = rest.length ? rest[0] : null;
  const done = draftId && rest.length > 1 ? rest[1] : () => {};
  const URL = replaceUrl(API.DRAFT_UPDATE_PUBLIC, "<draft_id>", draftId);
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

export const publicDraftSubmit = (data, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const URL = API.DRAFT_APPLICATION_CREATE_PUBLIC;
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

export const fetchDrafts = (data, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const URL = API.DRAFT_BASE;
  return (dispatch) => {
    httpGETRequest(URL)
      .then((res) => {
        if (res.data) {
          dispatch(setDraftlist(res.data));
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
          // dispatch(setDraftDetailStatusCode(res.status));
          done(null, draft);
        } else {
          // dispatch(serviceActionError(res));
          dispatch(setDraftDetail({}));
          // dispatch(setDraftDetailStatusCode(403));
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
        // dispatch(setDraftDetailStatusCode(403));
        done(error);
        // dispatch(setDraftDetailLoader(false));
      });
  };
};
