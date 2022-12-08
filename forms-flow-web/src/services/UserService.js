/* istanbul ignore file */
import {
  setUserDetails,
  setUserRole,
  setUserToken,
} from "../actions/bpmActions";
import { BPM_BASE_URL, WEB_BASE_CUSTOM_URL, WEB_BASE_URL } from "../apiManager/endpoints/config";
import { AppConfig } from '../config';
import {
  ANONYMOUS_ID,
  ANONYMOUS_USER,
  FORMIO_JWT_SECRET,
  Keycloak_Client,
  ROLES,
  USER_RESOURCE_FORM_ID
} from "../constants/constants";

import { _kc } from "../constants/tenantConstant";

const jwt = require("jsonwebtoken");

let KeycloakData = null;
let refreshInterval;

const initKeycloak = async (store, ...rest) => {
  try {
    const done = rest.length ? rest[0] : () => {};
    KeycloakData = await _kc; // Wait for Keycloak to be initialized
    
    const authenticated = await KeycloakData.init({
      onLoad: "check-sso",
      promiseType: "native",
      silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
      pkceMethod: "S256",
      checkLoginIframe: false
    });

    if (authenticated) {
      if (KeycloakData.resourceAccess[Keycloak_Client]) {
        const UserRoles = KeycloakData.resourceAccess[Keycloak_Client].roles;
        store.dispatch(setUserRole(UserRoles));
        store.dispatch(setUserToken(KeycloakData.token));
        setApiBaseUrlToLocalStorage();

        let roles = [];
        for (let i = 0; i < UserRoles.length; i++) {
          const roleData = ROLES.find((x) => x.title === UserRoles[i]);
          if (roleData) {
            roles = roles.concat(roleData.id);
          }
        }
        
        const userInfo = await KeycloakData.loadUserInfo();
        store.dispatch(setUserDetails(userInfo));
        
        const email = KeycloakData.tokenParsed.email || "external";
        authenticateFormio(email, roles);
        done(null, KeycloakData);
        refreshToken(store);
      } else {
        await doLogout();
      }
    } else {
      console.warn("not authenticated!");
      await doLogin();
    }
  } catch (error) {
    console.error("Failed to initialize Keycloak:", error);
    if (rest.length) {
      rest[0](error);
    }
  }
};

const refreshToken = (store) => {
  refreshInterval = setInterval(async () => {
    try {
      if (KeycloakData) {
        const refreshed = await KeycloakData.updateToken(5);
        if (refreshed) {
          store.dispatch(setUserToken(KeycloakData.token));
        }
      }
    } catch (error) {
      console.error("Failed to refresh token:", error);
      userLogout();
    }
  }, 6000);
};

const userLogout = async () => {
  try {
    localStorage.clear();
    sessionStorage.clear();
    clearInterval(refreshInterval);
    if (KeycloakData) {
      await KeycloakData.logout();
    }
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

const setApiBaseUrlToLocalStorage = () => {
  localStorage.setItem("bpmApiUrl", BPM_BASE_URL);
  localStorage.setItem("formioApiUrl", AppConfig.projectUrl);
  localStorage.setItem("formsflow.ai.url", window.location.origin);
  localStorage.setItem("formsflow.ai.api.url", WEB_BASE_URL);
  localStorage.setItem("customApiUrl", WEB_BASE_CUSTOM_URL);
};

const getFormioToken = () => localStorage.getItem("formioToken");

const authenticateAnonymousUser = (store) => {
  const user = ANONYMOUS_USER;
  const roles = [ANONYMOUS_ID];
  store.dispatch(setUserRole([user]));
  authenticateFormio(user, roles);
};

const authenticateFormio = (user, roles) => {
  const FORMIO_TOKEN = jwt.sign(
    {
      external: true,
      form: {
        _id: USER_RESOURCE_FORM_ID,
      },
      user: {
        _id: user,
        roles: roles,
      },
    },
    FORMIO_JWT_SECRET
  );
  localStorage.setItem("formioToken", FORMIO_TOKEN);
};

const doLogin = async () => {
  if (KeycloakData) {
    await KeycloakData.login();
  }
};

const doLogout = async () => {
  if (KeycloakData) {
    await KeycloakData.logout();
  }
};

const getToken = () => KeycloakData ? KeycloakData.token : null;

const UserService = {
  initKeycloak,
  userLogout,
  getToken,
  getFormioToken,
  authenticateAnonymousUser
};

export default UserService;
