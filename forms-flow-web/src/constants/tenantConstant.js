import { KEYCLOAK_AUTH_URL, Keycloak_Client, KEYCLOAK_REALM } from "./constants";
//TODO get from api
export const tenantDetail = {
  "realm": KEYCLOAK_REALM,
  "url": KEYCLOAK_AUTH_URL,
  "clientId": Keycloak_Client
};

const waitForKeycloak = () => new Promise((resolve) => {
  const checkKeycloak = () => {
    if (window.Keycloak) {
      resolve(new window.Keycloak(tenantDetail));
    } else {
      setTimeout(checkKeycloak, 100);
    }
  };
  checkKeycloak();
});

export const _kc = waitForKeycloak();
