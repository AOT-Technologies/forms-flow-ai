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

const navigateToDesignFormBuild = (dispatch,tenantId) => {
  navigateTo(dispatch,`${getRoute(tenantId).FORMFLOW}/build`);
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

const navigateToViewSubmission = (
  dispatch,
  tenantId,
  formId,
  applicationId
) => {
  dispatch(
    push(`${getRoute(tenantId).APPLICATION}/${applicationId}?from=formEntries`)
  );
};

const navigateToResubmit = (dispatch, tenantId, formId, submissionId ) => {
  navigateTo(dispatch,`${getRoute(tenantId).FORM}/${formId}/submissions/${submissionId}/resubmit`);
};

/* ---------------------------  Process Creation Routes --------------------------- */
const navigateToSubflowBuild = (dispatch, tenantId) => {
  navigateTo(dispatch, `${getRoute(tenantId).SUBFLOW}/build`);
};

const navigateToDecisionTableBuild = (dispatch, tenantId) => {
  navigateTo(dispatch, `${getRoute(tenantId).DECISIONTABLE}/build`);
};

const navigateToSubflowCreate = (dispatch, tenantId) => {
  navigateTo(dispatch, `${getRoute(tenantId).SUBFLOW}/create`);
};

const navigateToDecisionTableCreate = (dispatch, tenantId) => {
  navigateTo(dispatch, `${getRoute(tenantId).DECISIONTABLE}/create`);
};

const navigateToSubflowEdit = (dispatch, tenantId, processKey) => {
  navigateTo(dispatch, `${getRoute(tenantId).SUBFLOW}/edit/${processKey}`);
};

const navigateToDecisionTableEdit = (dispatch, tenantId, processKey) => {
  navigateTo(dispatch, `${getRoute(tenantId).DECISIONTABLE}/edit/${processKey}`);
};

export {
  navigateToDesignFormsListing,
  navigateToDesignFormCreate,
  navigateToDesignFormBuild,
  navigateToDesignFormEdit,
  navigateToSubmitFormsApplication,
  navigateToSubmitFormsDraft,
  navigateToSubmitFormsListing,
  navigateToFormEntries,
  navigateToNewSubmission,
  navigateToDraftEdit,
  navigateToViewSubmission,  
  navigateToResubmit,
  navigateToSubflowBuild,
  navigateToDecisionTableBuild,
  navigateToSubflowCreate,
  navigateToDecisionTableCreate,
  navigateToSubflowEdit,
  navigateToDecisionTableEdit,
};
