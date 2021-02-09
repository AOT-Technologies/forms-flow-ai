import VeeValidate from 'vee-validate';
import Vue from 'vue';
import VueLogger from 'vuejs-logger';
import App from './App';
import router from './router';
import store from './store';
import BootstrapVue from 'bootstrap-vue';

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import Keycloak from 'keycloak-js';


const options = {
  isEnabled: true, logLevel : Vue.config.productionTip  ? 'error' : 'debug', stringifyArguments : false, showLogLevel : true, showMethodName : true, separator: '|', showConsoleColors: true
};

Vue.config.productionTip = false;
Vue.use(VueLogger, options);
Vue.use(BootstrapVue)
Vue.use(VeeValidate)

// var jwt = rsequire("jsonwebtoken");
let initOptions = {
  url: process.env.VUE_APP_KEYCLOAK_URL,
  realm: process.env.VUE_APP_KEYCLOAK_REALM ,
  clientId: process.env.VUE_APP_KEYCLOAK_CLIENT_ID ,
  onLoad: 'login-required'
  // onLoad: 'check-sso'
}

// const STAFF_REVIEWER_ID = process.env.VUE_APP_REVIEWER_ROLE_ID
// const STAFF_REVIEWER = process.env.VUE_APP_REVIEWER_ROLE

// const STAFF_DESIGNER_ID = process.env.VUE_APP_DESIGNER_ROLE_ID
// const STAFF_DESIGNER = process.env.VUE_APP_DESIGNER_ROLE

// const CLIENT_ID = process.env.VUE_APP_CLIENT_ROLE_ID
// const CLIENT = process.env.VUE_APP_CLIENT_ROLE

// const ROLES = [
//   {
//     id: STAFF_REVIEWER_ID,
//     title: STAFF_REVIEWER,
//   },
//   {
//     id: STAFF_DESIGNER_ID,
//     title: STAFF_DESIGNER,
//   },
//   {
//     id: CLIENT_ID,
//     title: CLIENT,
//   },
// ];

let keycloak = Keycloak(initOptions);

keycloak.init({ onLoad: initOptions.onLoad }).then((auth) =>{
    
  if(!auth) {
    window.location.reload();
  } else {
    Vue.$log.info("Authenticated");
  }

  localStorage.setItem("vue-token", keycloak.token)
  localStorage.setItem("vue-refresh-token", keycloak.refreshToken)

  const email = keycloak.tokenParsed.email; 
  // const USER_RESOURCE_FORM_ID = process.env.VUE_APP_USER_RESOURCE_FORM_ID;

  const REVIEWER_ROLE_ID = process.env.VUE_APP_DESIGNER_ROLE;
  const roles = [REVIEWER_ROLE_ID];
  
  console.log(email)
  console.log(roles);
  //  authenticateFormio(email, roles);


  // const authenticateFormio = (user, roles) => {
  //   const FORMIO_TOKEN = jwt.sign(
  //     {
  //       form: {
  //         _id: USER_RESOURCE_FORM_ID, // form.io form Id of user resource
  //       },
  //       user: {
  //         _id: user, // keep it like that
  //         roles: roles,
  //       },
  //     },
  //     "--- change me now ---"
  //   ); // JWT secret key
  //   //TODO remove this token from local Storage on logout and try to move to redux store as well
  //   console.log(FORMIO_TOKEN);
  //   localStorage.setItem("formioToken", FORMIO_TOKEN);
  // };

  new Vue({
    router,
    store,
    render: h => h(App, {props: {keycloak: keycloak,}}),
  }).$mount('#app')


  setInterval(() =>{
    keycloak.updateToken(70).then((refreshed)=>{
      if (refreshed) {
        Vue.$log.debug('Token refreshed');
      } else {
        Vue.$log.warn('Token not refreshed, valid for '
        + Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds');
      }
    }).catch(()=>{
        Vue.$log.error('Failed to refresh token');
    });


  }, 6000)

}).catch(() =>{
Vue.$log.error("Authenticated Failed");
});
