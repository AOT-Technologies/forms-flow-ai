var jwt = require('jsonwebtoken');

const authenticateAnonymousUser = () => {
  const user = "anonymous";
  const ANONYMOUS_ID = (window._env_ && window._env_.REACT_APP_ANONYMOUS_ID) || process.env.VUE_APP_ANONYMOUS_ID;
  const roles = [ANONYMOUS_ID];

  authenticateFormio(user, roles);
}

const USER_RESOURCE_FORM_ID = process.env.VUE_APP_USER_RESOURCE_FORM_ID
// eslint-disable-next-line no-console
console.log(USER_RESOURCE_FORM_ID)
const authenticateFormio = (user, roles) => {
  // eslint-disable-next-line no-console
  console.log("Reached here");
  const FORMIO_TOKEN = jwt.sign(
    {
      form: {
        _id: USER_RESOURCE_FORM_ID, // form.io form Id of user resource
      },
      user: {
        _id: user, // keep it like that
        roles: roles,
      },
    },  'JWT_SECRET'
  );
// eslint-disable-next-line no-console
console.log(FORMIO_TOKEN)
localStorage.setItem("formiotoken", FORMIO_TOKEN)
  };

export default {
  authenticateAnonymousUser,
  authenticateFormio
};