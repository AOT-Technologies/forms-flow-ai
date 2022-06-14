//import { httpPOSTRequest} from "../httpRequestHandler";
import UserService from "../../services/UserService";
import API from "../endpoints/index";

// export const FileUPload = (data, ...rest) => {
//   const done = rest.length ? rest[0] : () => { };
//   const URL = API.CMIS_UPLOAD_FILE;
//   httpPOSTRequest(URL, data, UserService.getToken())
//     .then((res) => {
//       if (res.data) {
//         done(null, res.data);
//         console.log(res.data);
             
//       } else {
//         // dispatch(serviceActionError(res));
//         done("Error Posting data");
//       }
//     })
//     .catch((error) => {
//       //   dispatch(serviceActionError(error));
      
//       done(error);``
//     });
    

// };

// export const fetchCMISfile = (name, ...rest) => {
//   const done = rest.length ? rest[0] : () => { };
//   const downloadURL = API.CMIS_DOWNLOAD_FILE + name;
//   console.log("apiURL   :", API.CMIS_DOWNLOAD_FILE);
//   console.log("download URL  :", downloadURL);
//   httpGETRequest(downloadURL, {}, UserService.getToken())
//     .then((res) => {
//       if (res.data) {
//         done(null, res.data);
//         console.log("resData in main: ", res.data);
//         return "res.data is returning";
//       }
//     })
//     .catch((error) => {
//       done(error);
//     });

// };

