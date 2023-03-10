import {
    httpPOSTRequest, httpPUTRequest,
  } from "../httpRequestHandler";
import API from "../endpoints";
import { setBundleProcessData, setBundleSelectedForms, setBundleWorkflow } from "../../actions/bundleActions";
import { replaceUrl } from "../../helper/helper";


  
export const bundleCreate = (bundleData,...rest) => { 
    const done = rest.length ? rest[0] : () => {};
    return (dispatch) => {
        httpPOSTRequest(API.BUNDLE_BASE, bundleData)
          .then((res) => {
            console.log(res.data);
            if (res.data?.mapperData) {
              dispatch(setBundleProcessData(res.data.mapperData));
              dispatch(setBundleSelectedForms(res.data.selectedForms));
              dispatch(setBundleWorkflow({label:res.data.mapperData.processName,
                value:res.data.mapperData.processKey}));
            } 
            // else {
            //   dispatch(setBundleSelectedForms([]));
            //   dispatch(setBundleProcessData({}));

            // }
          })
          .catch((err) => {
            done(err, null);
          });
      };
  };

export const bundleProcessUpdate = (data, bundleId)=>{
    const url = replaceUrl(API.BUNDLE_PROCESS_UPDATE,"<bundle_id>",bundleId);
    return httpPUTRequest(url, data);
};
   