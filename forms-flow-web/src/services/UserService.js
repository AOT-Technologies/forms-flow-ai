 /* istanbul ignore file */
import {
  ROLES,
  USER_RESOURCE_FORM_ID,
  ANONYMOUS_USER,
  ANONYMOUS_ID,
  FORMIO_JWT_SECRET,
  MULTITENANCY_ENABLED
} from "../constants/constants";
import {
  setUserRole,
  setUserToken,
  setUserDetails,
} from "../actions/bpmActions";
import {BPM_BASE_URL} from "../apiManager/endpoints/config";
import {AppConfig} from '../config';
import {WEB_BASE_URL , WEB_BASE_CUSTOM_URL} from "../apiManager/endpoints/config";

// import {_kc} from "../constants/tenantConstant";
import { setLanguage } from "../actions/languageSetAction";
import Keycloak from "keycloak-js";
import {getTenantKeycloakJson} from "../apiManager/services/tenantServices";

const jwt = require("jsonwebtoken");
let KeycloakData, doLogin, doLogout ;

const setKeycloakJson = (tenantKey=null, ...rest)=>{
  let kcJson;
  const done = rest.length ? rest[0] :  ()=>{};
  kcJson = getTenantKeycloakJson(tenantKey);
  KeycloakData = new Keycloak(kcJson);
  doLogin = KeycloakData?.login;
  doLogout = KeycloakData?.logout;
  done(kcJson.clientId);
}

/**
 * Initializes Keycloak instance and calls the provided callback function if successfully authenticated.
 *
 * @param onAuthenticatedCallback
 */
// const KeycloakData = new Keycloak(tenantDetail);


const initKeycloak = (store, ...rest) => {
  const clientId = rest.length && rest[0]
  const done = rest.length ? rest[1] : () => {};
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
        if (KeycloakData.resourceAccess[clientId]) {
          const UserRoles = KeycloakData.resourceAccess[clientId].roles;
          store.dispatch(setUserRole(UserRoles));
          store.dispatch(setUserToken(KeycloakData.token));
          store.dispatch(setLanguage(KeycloakData.tokenParsed.locale||'en'));
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
          authenticateFormio(email, roles, KeycloakData.tokenParsed?.tenantKey);
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

const getTokenExpireTime =(keycloak)=>{
  const {exp, iat} = keycloak.tokenParsed;
  if(exp&&iat){
    const toeknExpiretime =new Date(exp).getMilliseconds()-new Date(iat).getMilliseconds()
    return toeknExpiretime*1000
  }else{
    return 60000
  }
}


let refreshInterval;
const refreshToken = (store) => {
  const refreshTime = getTokenExpireTime(KeycloakData)
  refreshInterval = setInterval(() => {
    KeycloakData && KeycloakData.updateToken(5).then((refreshed)=> {
      if (refreshed) {
         clearInterval(refreshInterval)
         store.dispatch(setUserToken(KeycloakData.token));
         refreshToken(store)
      }
    }).catch( (error)=> {
      console.log(error);
      userLogout();
    });
  }, refreshTime);
}


/**
 * Logout function
 */
const userLogout = () => {
  const language=localStorage.getItem("lang")
  localStorage.clear();
  localStorage.setItem("lang",language)
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

const authenticateFormio = (user, roles,tenantKey) => {
  let tenantData={}
  if(tenantKey&&MULTITENANCY_ENABLED){
    tenantData={tenantKey}
  }
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
      ...tenantData
    },
    FORMIO_JWT_SECRET
  ); // TODO Move JWT secret key to COME From ENV
  //TODO remove this token from local Storage on logout and try to move to redux store as well
  localStorage.setItem("formioToken", FORMIO_TOKEN);
};


// const KeycloakData= _kc;

// const doLogin = KeycloakData.login;
// const doLogout = KeycloakData.logout;
const getToken = () => KeycloakData?.token;

const UserService ={
  initKeycloak,
  userLogout,
  getToken,
  getFormioToken,
  authenticateAnonymousUser,
  setKeycloakJson
};

export default UserService;
