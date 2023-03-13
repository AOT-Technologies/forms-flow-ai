import {
  httpGETRequest,
    httpPOSTRequest,
    httpPUTRequest
  } from "../httpRequestHandler";
import API from "../endpoints";
// import { setBundleProcessData, setBundleSelectedForms, setBundleWorkflow } from "../../actions/bundleActions";
import { replaceUrl } from "../../helper/helper";


  
export const bundleCreate = (bundleData,mapperId) => {
    const url = replaceUrl(API.BUNDLE_BASE,"<mapper_id>",mapperId);
    return httpPOSTRequest(url, bundleData);
  };
export const getBundle = (mapperId) => {
    const url = replaceUrl(API.BUNDLE_BASE,"<mapper_id>",mapperId);
    return httpGETRequest(url);
  };
export const bundleUpdate = (bundleData,mapperId) => {
    const url = replaceUrl(API.BUNDLE_BASE,"<mapper_id>",mapperId);
    return httpPUTRequest(url, bundleData);
  };
 
   