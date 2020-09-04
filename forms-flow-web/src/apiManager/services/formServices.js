import { httpPOSTRequest } from "../httpRequestHandler";
import API from "../endpoints";
import {
  serviceActionError,
} from "../../actions/taskActions";

export const saveFormProcessMapper = (data, ...rest) => {
  console.log('data inside save '+data);
 
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    httpPOSTRequest('http://localhost:5000/form', data)
    //httpPOSTRequest(`${API.FORM}`, data)
      .then((res) => {
        // if (res.status === 200) {
        //TODO REMOVE
        done(null, res.data);
        // }
      })
      .catch((error) => {
        console.log("Error", error);
        dispatch(serviceActionError(error));
        done(error);
      });
  };
};
