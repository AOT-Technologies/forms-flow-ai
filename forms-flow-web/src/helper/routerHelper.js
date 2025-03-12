import { push } from "connected-react-router";
import { getRoute } from "../constants/constants";


const navigateTo = (dispatch,baseUrl) => {
  dispatch(push(baseUrl));
};

/* ---------------------------  Designer Routes --------------------------- */
const navigateToDesignFormsListing = (dispatch,tenantId) => {
  navigateTo(dispatch,getRoute(tenantId).FORMFLOW);
};

const navigateToDesignFormCreate = (dispatch,tenantId) => {
  navigateTo(dispatch,`${getRoute(tenantId).FORMFLOW}/create`);
};

const navigateToDesignFormEdit = (dispatch,tenantId,formId) => {
  navigateTo(dispatch,`${getRoute(tenantId).FORMFLOW}/${formId}/edit`);
};

/* ---------------------------  Client Submission Routes --------------------------- */
const navigateToSubmitFormsApplication = (dispatch,tenantId) => {
  navigateTo(dispatch,getRoute(tenantId).APPLICATION);
};

const navigateToSubmitFormsDraft = (dispatch,tenantId) => {
  navigateTo(dispatch,getRoute(tenantId).DRAFT);
};

const navigateToSubmitFormsListing = (dispatch,tenantId) => {
  navigateTo(dispatch,getRoute(tenantId).FORM);
};

// new navigations for client journey
const navigateToFormEntries = (dispatch, tenantId, formId) => {
  navigateTo(dispatch,`${getRoute(tenantId).FORM}/${formId}/entries`);
};

const navigateToNewSubmission = (dispatch, tenantId, formId) => {
  navigateTo(dispatch,`${getRoute(tenantId).FORM}/${formId}`);
};

const navigateToDraftEdit = (dispatch, tenantId, formId, applicationId ) => {
  navigateTo(dispatch,`${getRoute(tenantId).FORM}/${formId}/draft/${applicationId}/edit`);
};

const navigateToViewSubmission = (dispatch, tenantId, formId, applicationId ) => {
  navigateTo(dispatch,`${getRoute(tenantId).APPLICATION}/${applicationId}`);
};




export {
  navigateToDesignFormsListing,
  navigateToDesignFormCreate,
  navigateToDesignFormEdit,
  navigateToSubmitFormsApplication,
  navigateToSubmitFormsDraft,
  navigateToSubmitFormsListing,
  navigateToFormEntries,
  navigateToNewSubmission,
  navigateToDraftEdit,
  navigateToViewSubmission,  
};
