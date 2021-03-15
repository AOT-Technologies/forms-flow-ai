import {httpGETRequest} from "../httpRequestHandler";
import API from "../endpoints";
import UserService from "../../services/UserService";
import {
  serviceActionError,
} from "../../actions/bpmTaskActions";

import {setBPMFormList} from "../../actions/formActions";

export const fetchBPMFormList = (...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    httpGETRequest(API.GET_BPM_FORM_LIST, {}, UserService.getToken())
      .then((res) => {
        if (res.data) {
          dispatch(setBPMFormList(res.data));
          //dispatch(setBPMLoader(false));
          done(null, res.data);
        } else {
          console.log("Error", res);
          dispatch(serviceActionError(res));
          //dispatch(setBPMTaskLoader(false));
        }
      })
      .catch((error) => {
        console.log("Error", error);
        dispatch(serviceActionError(error));
        //dispatch(setBPMTaskLoader(false));
        done(error);
      });
  };
};
