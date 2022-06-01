import ACTION_CONSTANTS from "./actionConstants";

export const resetTenant = (tenantId) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.RESET_TENANT,
    payload: tenantId,
  });
};

export const setTenantID = (tenantID) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.SET_TENANT_ID,
    payload: tenantID,
  });
};

export const setTenantDetails = (tenantDetails) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.SET_TENANT_DETAILS,
    payload: tenantDetails,
  });
};

export const setTenantListLoading = (isLoading) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.IS_TENANT_LIST_LOADING,
    payload: isLoading,
  });
};

export const setTenantDetailLoading = (isLoading) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.IS_TENANT_DETAIL_LOADING,
    payload: isLoading,
  });
};

// eslint-disable-next-line no-unused-vars
export const serviceActionError = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.ERROR,
    payload: "Error Handling Message",
  });
};
