import { KEYCLOAK_AUTH_URL, Keycloak_Client, KEYCLOAK_REALM } from "./constants";
const Keycloak = await import("https://cdn.jsdelivr.net/npm/keycloak-js@26.1.4/+esm");
//TODO get from api
export const tenantDetail = {
  "realm": KEYCLOAK_REALM,
  "url": KEYCLOAK_AUTH_URL,
  "clientId": Keycloak_Client
};

export const _kc = new Keycloak.default(tenantDetail);
