 /* istanbul ignore file */
import {
  ROLES,
  USER_RESOURCE_FORM_ID,
  Keycloak_Client,
  ANONYMOUS_USER,
  ANONYMOUS_ID,
  FORMIO_JWT_SECRET
} from "../constants/constants";
import {
  setUserRole,
  setUserToken,
  setUserDetails,
} from "../actions/bpmActions";
import {BPM_BASE_URL} from "../apiManager/endpoints/config";
import {AppConfig} from '../config';
import {WEB_BASE_URL , WEB_BASE_CUSTOM_URL} from "../apiManager/endpoints/config";

import {_kc} from "../constants/tenantConstant";

const jwt = require("jsonwebtoken");

/**
 * Initializes Keycloak instance and calls the provided callback function if successfully authenticated.
 *
 * @param onAuthenticatedCallback
 */
// const KeycloakData = new Keycloak(tenantDetail);


const initKeycloak = (store, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  KeycloakData
    .init({
      onLoad: "check-sso",
      promiseType: "native",
      silentCheckSsoRedirectUri:
        window.location.origin + "/silent-check-sso.html",
      pkceMethod: "S256",
      checkLoginIframe: false
    })
    .then((authenticated) => {
      if (authenticated) {
        if (KeycloakData.resourceAccess[Keycloak_Client]) {
          const UserRoles = KeycloakData.resourceAccess[Keycloak_Client].roles;
          store.dispatch(setUserRole(UserRoles));
          store.dispatch(setUserToken(KeycloakData.token));
          //Set Cammunda/Formio Base URL
          setApiBaseUrlToLocalStorage();

          let roles = [];
          for (let i = 0; i < UserRoles.length; i++) {
            const roleData = ROLES.find((x) => x.title === UserRoles[i]);
            if (roleData) {
              roles = roles.concat(roleData.id);
            }
          }
          KeycloakData.loadUserInfo().then((res) => store.dispatch(setUserDetails(res)));
          const email = KeycloakData.tokenParsed.email || "external";
          authenticateFormio(email, roles);
          // onAuthenticatedCallback();
          done(null, KeycloakData);
          refreshToken(store);
        } else {
          doLogout();
        }
      } else {
        console.warn("not authenticated!");
        doLogin();
      }
    });
};
let refreshInterval;
const refreshToken = (store) => {
  refreshInterval = setInterval(() => {
    KeycloakData && KeycloakData.updateToken(5).then((refreshed)=> {
      if (refreshed) {
        store.dispatch(setUserToken(KeycloakData.token));
      }
    }).catch( (error)=> {
      console.log(error);
      userLogout();
    });
  }, 6000);
}


/**
 * Logout function
 */
const userLogout = () => {
  localStorage.clear();
  sessionStorage.clear();
  clearInterval(refreshInterval);
  doLogout();
};

const setApiBaseUrlToLocalStorage = ()=> {
  localStorage.setItem("bpmApiUrl", BPM_BASE_URL);
  localStorage.setItem("formioApiUrl", AppConfig.projectUrl);
  localStorage.setItem("formsflow.ai.url",window.location.origin)
  localStorage.setItem("formsflow.ai.api.url", WEB_BASE_URL);
  localStorage.setItem("customApiUrl", WEB_BASE_CUSTOM_URL);
}



const getFormioToken = () => localStorage.getItem("formioToken");

//const getUserEmail = () => KeycloakData.tokenParsed.email;

/*const updateToken = (successCallback) => {
  return KeycloakData.updateToken(5).then(successCallback).catch(doLogin);
};*/

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
        _id: USER_RESOURCE_FORM_ID, // form.io form Id of user resource
      },
      user: {
        _id: user, // keep it like that
        roles: roles,
      },
    },
    FORMIO_JWT_SECRET
  ); // TODO Move JWT secret key to COME From ENV
  //TODO remove this token from local Storage on logout and try to move to redux store as well
  localStorage.setItem("formioToken", FORMIO_TOKEN);
};


const KeycloakData= _kc;

const doLogin = KeycloakData.login;
const doLogout = KeycloakData.logout;
const getToken = () => KeycloakData.token;

const UserService ={
  initKeycloak,
  userLogout,
  getToken,
  getFormioToken,
  authenticateAnonymousUser
};

export default UserService;
