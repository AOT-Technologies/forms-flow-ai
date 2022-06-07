import { httpPOSTRequestWithoutToken } from "../httpRequestHandler";
import API from "../endpoints/index";

const FileUPload = (data, ...rest) => {
    const done = rest.length ? rest[0] : () => {};
    const URL = API.CMIS_UPLOAD_FILE;
    console.log("DATA: ", ...data);
    console.log("SERVER ENDPOINT : ", URL);

    httpPOSTRequestWithoutToken(URL, data)
    .then((res) => {
      if (res.data) {
        done(null, res.data);
        console.log(res.data);
      } else {
        // dispatch(serviceActionError(res));
        done("Error Posting data");
      }
    })
    .catch((error) => {
    //   dispatch(serviceActionError(error));
      done(error);
    });
};
export default FileUPload;