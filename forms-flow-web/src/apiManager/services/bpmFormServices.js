import {httpGETRequest, httpPOSTRequestWithoutToken} from "../httpRequestHandler";
import API from "../endpoints";
import UserService from "../../services/UserService";
import {
  serviceActionError,
} from "../../actions/bpmTaskActions";
import { setUserToken } from "../../actions/bpmActions";
import {setBPMFormList, setBPMFormListLoading} from "../../actions/formActions";
import {GET_BPM_TOKEN_URL} from "../endpoints/config";
import {BPM_USER_DETAILS} from "../../constants/constants";

export const fetchBPMFormList = (...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    httpGETRequest(API.GET_BPM_FORM_LIST, {}, UserService.getToken())
      .then((res) => {
        if (res.data) {
          dispatch(setBPMFormList(res.data));
          dispatch(setBPMFormListLoading(false));
          //dispatch(setBPMLoader(false));
          done(null, res.data);
        } else {
          dispatch(setBPMFormListLoading(false));
          console.log("Error", res);
          dispatch(serviceActionError(res));
          //dispatch(setBPMTaskLoader(false));
        }
      })
      .catch((error) => {
        console.log("Error", error);
        dispatch(setBPMFormListLoading(false));
        dispatch(serviceActionError(error));
        //dispatch(setBPMTaskLoader(false));
        done(error);
      });
  };
};

export const getUserToken = (...rest) => {
    const done = rest.length ? rest[0] :  ()=>{};
    return dispatch => {
      httpPOSTRequestWithoutToken(GET_BPM_TOKEN_URL, BPM_USER_DETAILS ).then(res => {
        if (res.data) {
          //TODO update refresh token logic
          const token=res.data.access_token;
          dispatch(setUserToken(token)); //Set any other data for usages
          done(null,res);
        } else {
          dispatch(serviceActionError(res))
          done('Error Posting data');
        }
      }).catch((error) => {
        console.log(error)
        dispatch(serviceActionError(error))
        done(error);
      })
    }
};
