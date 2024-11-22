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

export {
  navigateToDesignFormsListing,
  navigateToDesignFormCreate,
  navigateToDesignFormEdit,
  navigateToSubmitFormsApplication,
  navigateToSubmitFormsDraft,
  navigateToSubmitFormsListing,
};
