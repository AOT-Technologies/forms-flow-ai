import { ROLES, USER_RESOURCE_FORM_ID, Keycloak_Client, _kc } from '../constants/constants';
import { setUserRole, setUserToken, setUserDetails } from "../actions/bpmActions";

const jwt = require('jsonwebtoken');

/**
 * Initializes Keycloak instance and calls the provided callback function if successfully authenticated.
 *
 * @param onAuthenticatedCallback
 */
const initKeycloak = (onAuthenticatedCallback, store) => {
  _kc.init({
    onLoad: 'check-sso',
    promiseType: 'native',
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    pkceMethod: 'S256',
  })
    .then((authenticated) => {
      if (authenticated) {
        if(KeycloakData.resourceAccess[Keycloak_Client]){
          const UserRoles=KeycloakData.resourceAccess[Keycloak_Client].roles;
          store.dispatch(setUserRole(UserRoles));
          store.dispatch(setUserToken(KeycloakData.token));
          
          let role = [];
          for (let i = 0; i < UserRoles.length; i++) {
            const roleData = ROLES.find(x => x.title === UserRoles[i]);
            if(roleData){
              role = role.concat(roleData.id)
            }
          }
          _kc.loadUserInfo().then(res=>store.dispatch(setUserDetails(res)))
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
        }else{
          doLogout()
        }
      } else {
        console.warn("not authenticated!");
        doLogin();
      }
    })
};

const doLogin = _kc.login;

const doLogout = _kc.logout;

/**
 * Logout function
 */
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
