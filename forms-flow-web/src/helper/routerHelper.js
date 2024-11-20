import { push } from "connected-react-router";
import { ROUTE_TO } from "../constants/constants";


const navigateTo = (dispatch,baseUrl) => {
  dispatch(push(baseUrl));
};

/* ---------------------------  Designer Routes --------------------------- */
const navigateToDesignFormsListing = (dispatch) => {
  navigateTo(dispatch,ROUTE_TO.FORMFLOW);
};

const navigateToDesignFormCreate = (dispatch) => {
  navigateTo(dispatch,`${ROUTE_TO.FORMFLOW}/create`);
};

const navigateToDesignFormEdit = (dispatch,formId) => {
  navigateTo(dispatch,`${ROUTE_TO.FORMFLOW}/${formId}/edit`);
};

/* ---------------------------  Client Submission Routes --------------------------- */
const navigateToSubmitFormsApplication = (dispatch) => {
  navigateTo(dispatch,ROUTE_TO.APPLICATION);
};

const navigateToSubmitFormsDraft = (dispatch) => {
  navigateTo(dispatch,ROUTE_TO.DRAFT);
};

const navigateToSubmitFormsListing = (dispatch) => {
  navigateTo(dispatch,ROUTE_TO.FORM);
};

export {
  navigateToDesignFormsListing,
  navigateToDesignFormCreate,
  navigateToDesignFormEdit,
  navigateToSubmitFormsApplication,
  navigateToSubmitFormsDraft,
  navigateToSubmitFormsListing,
};
