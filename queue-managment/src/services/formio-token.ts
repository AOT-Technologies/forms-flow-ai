import jwt from "jsonwebtoken";


export const authenticateFormio = (userEmail, roles) => {
    const USER_RESOURCE_FORM_ID = process.env.VUE_APP_USER_RESOURCE_FORM_ID;
    const FORMIO_TOKEN = jwt.sign(
        {
            form: {
                _id: USER_RESOURCE_FORM_ID, // form.io form Id of user resource
            },
            user: {
                _id: userEmail, // keep it like that
                roles: roles,
            },
        },
        "--- change me now ---"
    ); // JWT secret key
    //TODO remove this token from local Storage on logout and try to move to redux store as well
    sessionStorage.setItem("formioToken", FORMIO_TOKEN);
};