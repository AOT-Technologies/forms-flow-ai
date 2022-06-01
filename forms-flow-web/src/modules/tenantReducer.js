import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
  tenantId: sessionStorage.getItem("tenantKey") || "",
  tenantDetail: sessionStorage.getItem("tenant")
    ? JSON.parse(sessionStorage.getItem("tenant"))
    : null,
  isTenantDetailLoading: false,
};

const tenants = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_CONSTANTS.SET_TENANT_ID:
      sessionStorage.setItem("tenantKey", action.payload);
      return { ...state, tenantId: action.payload };
    case ACTION_CONSTANTS.SET_TENANT_DETAILS:
      sessionStorage.setItem("tenant", JSON.stringify(action.payload));
      return {
        ...state,
        tenantDetail: action.payload,
        isTenantDetailLoading: false,
      };
    case ACTION_CONSTANTS.IS_TENANT_DETAIL_LOADING:
      return { ...state, isTenantDetailLoading: action.payload };
    case ACTION_CONSTANTS.RESET_TENANT:
      sessionStorage.setItem("tenantKey", action.payload || "");
      sessionStorage.setItem("tenant", "");
      return {
        ...state,
        tenantId: action.payload,
        tenantDetail: null,
        tenantName: "",
      };
    default:
      return state;
  }
};

export default tenants;
