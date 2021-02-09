import VeeValidate from 'vee-validate';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import Vue from 'vue';
import VueLogger from 'vuejs-logger';
import App from './App';
import router from './router';
import store from './store';

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import Keycloak from 'keycloak-js';

Vue.config.productionTip = false;
const options = {
  isEnabled: true,
  logLevel : Vue.config.productionTip  ? 'error' : 'debug',
  stringifyArguments : false,
  showLogLevel : true,
  showMethodName : true,
  separator: '|',
  showConsoleColors: true
};
Vue.use(VueLogger, options);
Vue.use(VeeValidate);
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)

const jwt = require("jsonwebtoken");
let initOptions = {
  url: process.env.VUE_APP_KEYCLOAK_URL,
  realm: process.env.VUE_APP_KEYCLOAK_REALM ,
  clientId: process.env.VUE_APP_KEYCLOAK_CLIENT_ID ,
  onLoad: 'login-required',
}
const STAFF_REVIEWER_ID = process.env.VUE_APP_REVIEWER_ROLE_ID
const STAFF_REVIEWER = process.env.VUE_APP_REVIEWER_ROLE

const STAFF_DESIGNER_ID = process.env.VUE_APP_DESIGNER_ROLE_ID
const STAFF_DESIGNER = process.env.VUE_APP_DESIGNER_ROLE

const CLIENT_ID = process.env.VUE_APP_CLIENT_ROLE_ID
const CLIENT = process.env.VUE_APP_CLIENT_ROLE

const ROLES = [
  {
    id: STAFF_REVIEWER_ID,
    title: STAFF_REVIEWER,
  },
  {
    id: STAFF_DESIGNER_ID,
    title: STAFF_DESIGNER,
  },
  {
    id: CLIENT_ID,
    title: CLIENT,
  },
];

let keycloak = Keycloak(initOptions);

keycloak.init({ onLoad: initOptions.onLoad }).then((auth) =>{
    
  if(!auth) {
    window.location.reload();
  } else {
    Vue.$log.info("Authenticated");
  }


  const USER_RESOURCE_FORM_ID = process.env.VUE_APP_USER_RESOURCE_FORM_ID
  const email = keycloak.tokenParsed.email
  const Keycloak_Client = process.env.VUE_APP_KEYCLOAK_CLIENT_ID

  if(keycloak.resourceAccess[Keycloak_Client]) {
    const UserRoles = keycloak.resourceAccess[Keycloak_Client].roles;
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
      "--- change me now ---"
    ); 
    localStorage.setItem("formioToken", FORMIO_TOKEN);
  }
    
  else {
    console.log("Didnt generate formio token");
  }
  localStorage.setItem("vue-token", keycloak.token)
  localStorage.setItem("vue-refresh-token", keycloak.refreshToken)

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
