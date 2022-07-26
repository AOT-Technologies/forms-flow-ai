import {
  httpPOSTRequest,
  httpPUTRequest,
  httpPUTRequestWithoutToken,
} from "../httpRequestHandler";
import API from "../endpoints";
import { replaceUrl } from "../../helper/helper";
import { setDraftSubmission } from "../../actions/draftActions";

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

// TODO: API support for public draft submit

export const publicDraftSubmit = (data, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const URL = API.DRAFT_APPLICATION_CREATE;
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
