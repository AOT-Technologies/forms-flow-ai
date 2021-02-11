import jwt from 'jsonwebtoken';


const USER_RESOURCE_FORM_ID = process.env.VUE_APP_USER_RESOURCE_FORM_ID
const email = keycloak.tokenParsed.email
const KeycloakClient = process.env.VUE_APP_KEYCLOAK_CLIENT_ID


    if(keycloak.resourceAccess[KeycloakClient]) {
      const UserRoles = keycloak.resourceAccess[KeycloakClient].roles;
      let roles = [];
      for (let i = 0; i < UserRoles.length; i++) {
        const roleData = ROLES.find((x) => x.title === UserRoles[i]);
        if (roleData) {
          roles = roles.concat(roleData.id);
        }
      }

const FORMIO_TOKEN = jwt.sign(
    {
      form: {
        _id: USER_RESOURCE_FORM_ID, // form.io form Id of user resource
      },
      user: {
        _id: email, // keep it like that
        roles: roles,
      },
    },
  ); 

sessionStorage.setItem("formioToken", FORMIO_TOKEN);