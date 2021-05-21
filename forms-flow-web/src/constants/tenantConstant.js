import {Keycloak_Client, KEYCLOAK_REALM, KEYCLOAK_AUTH_URL} from "./constants";

//TODO get from api
export const tenantDetail = {
  "realm": KEYCLOAK_REALM,
  "url": KEYCLOAK_AUTH_URL,
  "clientId": Keycloak_Client
};
