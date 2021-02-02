import Keycloak from "keycloak-js";

export const _kc = new Keycloak("/config/kc/keycloak.json");
export const Keycloak_Client =
  (window._env_ && window._env_.REACT_APP_KEYCLOAK_CLIENT) ||
  process.env.REACT_APP_KEYCLOAK_CLIENT ||
  "forms-flow-vue";
const jwt = require("jsonwebtoken");

/**
 * Initializes Keycloak instance and calls the provided callback function if successfully authenticated.
 *
 * @param onAuthenticatedCallback
 */
//  what is this store?
//  what is rest?
const initKeycloak = (store, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  _kc
    .init({
      onLoad: "check-sso",
      promiseType: "native",
      silentCheckSsoRedirectUri:
        window.location.origin + "/silent-check-sso.html",
      pkceMethod: "S256",
    })
    .then((authenticated) => {
      if (authenticated) {
        if (KeycloakData.resourceAccess[Keycloak_Client]) {
          const UserRoles = KeycloakData.resourceAccess[Keycloak_Client].roles;
          store.dispatch(setUserRole(UserRoles));
          store.dispatch(setUserToken(KeycloakData.token));

          let roles = [];
          for (let i = 0; i < UserRoles.length; i++) {
            const roleData = ROLES.find((x) => x.title === UserRoles[i]);
            if (roleData) {
              roles = roles.concat(roleData.id);
            }
          }
          _kc.loadUserInfo().then((res) => store.dispatch(setUserDetails(res)));
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
    _kc.updateToken(5).then((refreshed)=> {
      if (refreshed) {
        store.dispatch(setUserToken(KeycloakData.token));
      }
    }).catch( (error)=> {
      console.log(error);
      userLogout();
    });
  }, 6000);
}
const doLogin = _kc.login;

const doLogout = _kc.logout;

const authenticateFormio = (user, roles) => {
    const FORMIO_TOKEN = jwt.sign(
      {
        form: {
          _id: USER_RESOURCE_FORM_ID, // form.io form Id of user resource
        },
        user: {
          _id: user, // keep it like that
          roles: roles,
        },
      },
      "--- change me now ---"
    ); // JWT secret key
    //TODO remove this token from local Storage on logout and try to move to redux store as well
    localStorage.setItem("formioToken", FORMIO_TOKEN);
  };

  const KeycloakData = _kc;