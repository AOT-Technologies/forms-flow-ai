//import { httpPOSTRequest, httpPUTRequest } from "../httpRequestHandler";
//import API from "../endpoints";
//import { serviceActionError } from "../../actions/taskActions";

// export const saveFormProcessMapper = (data, update = false, ...rest) => {
//   const done = rest.length ? rest[0] : () => {};
//   return (dispatch) => {
//     let request;

//     if (update) {
//       request = httpPUTRequest(`${API.FORM}/${data.id}`, data);
//     } else {
//       request = httpPOSTRequest(`${API.FORM}`, data);
//     }
//     request
//       .then((res) => {
//         // if (res.status === 200) {
//         //TODO REMOVE
//         done(null, res.data);
//         dispatch(setFormProcessesData(res.data));
//         // }
//       })
//       .catch((error) => {
//         console.log("Error", error);
//         dispatch(serviceActionError(error));
//         done(error);
//       });
//   };
// };

