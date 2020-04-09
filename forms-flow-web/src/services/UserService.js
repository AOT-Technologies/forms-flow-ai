import Keycloak from "keycloak-js";
import {ROLES, USER_RESOURCE_FORM_ID,Keycloak_Client} from '../constants/constants';
const _kc = new Keycloak('/keycloak.json');
const jwt = require('jsonwebtoken');

/**
 * Initializes Keycloak instance and calls the provided callback function if successfully authenticated.
 *
 * @param onAuthenticatedCallback
 */
const initKeycloak = (onAuthenticatedCallback) => {
  _kc.init({
    onLoad: 'check-sso',
    promiseType: 'native',
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    pkceMethod: 'S256',
  })
    .then((authenticated) => {
      if (authenticated) {
        // debugger;
        // if (window.location.pathname !== '/'){
        //   window.location.replace(`${window.location.origin}/`)
        // }
        const UserRoles=KeycloakData.resourceAccess[Keycloak_Client].roles
        localStorage.setItem('UserRoles',UserRoles);
        let role = [];
        for (let i = 0; i < UserRoles.length; i++) {
          const roledata = ROLES.find(x => x.title === UserRoles[i]);
          if(roledata){
            role = role.concat(roledata.id)
          }
        }
        const email= KeycloakData.tokenParsed.email || 'external';
        const FORMIO_TOKEN = jwt.sign({
          form: {
            _id: USER_RESOURCE_FORM_ID // form.io form Id of user resource
          },
          user: {
            _id: email, // keep it like that
            roles: role
          }
        }, '--- change me now ---'); // JWT secret key
        //TODO remove this token from local Storage on logout and try to move to redux store as well
        localStorage.setItem('formioToken', FORMIO_TOKEN);
        onAuthenticatedCallback();
      } else {
        console.warn("not authenticated!");
        doLogin();
      }
    })
};

const doLogin = _kc.login;

const doLogout = _kc.logout;
const userLogout = ()=>{
  localStorage.clear();
  sessionStorage.clear();
  doLogout()
}

const getToken = () => _kc.token;

const getFormioToken = () => localStorage.getItem('formioToken');

const getUserEmail = () => _kc.tokenParsed.email;

const updateToken = (successCallback) => {
  return _kc.updateToken(5)
    .then(successCallback)
    .catch(doLogin)
};

const KeycloakData = _kc;
export default {
  initKeycloak,
  doLogin,
  userLogout,
  getToken,
  updateToken,
  KeycloakData,
  getFormioToken,
  getUserEmail
}
