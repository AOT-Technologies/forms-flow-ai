import Vue from 'vue';
import App from './App.vue';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import router from './router';
import store from './store';
import jwt from 'jsonwebtoken'
import Keycloak from 'keycloak-js';
import {authenticateFormio} from "@/services/formio-token";

Vue.config.productionTip = false;

Vue.use(BootstrapVue)
Vue.use(IconsPlugin)


const initOptions = {
  url: process.env.VUE_APP_KEYCLOAK_URL,
  realm: process.env.VUE_APP_KEYCLOAK_REALM ,
  clientId: process.env.VUE_APP_KEYCLOAK_CLIENT_ID ,
}
const STAFF_REVIEWER_ID = process.env.VUE_APP_REVIEWER_ROLE_ID
const STAFF_REVIEWER = process.env.VUE_APP_REVIEWER_ROLE

const ROLES = [
  {
    id: STAFF_REVIEWER_ID,
    title: STAFF_REVIEWER,
  },
];

const keycloak = Keycloak(initOptions);

keycloak.init({onLoad: "login-required"}).then((auth) =>{
    
    if(!auth) {
      window.location.reload();
    } else {
      console.log("authenticated");
    }

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

      authenticateFormio(email,roles);
    }
    
    else {
      console.log("Didnt generate formio token");
    }
  sessionStorage.setItem("vue-token", keycloak.token)
  sessionStorage.setItem("vue-refresh-token", keycloak.refreshToken)

  new Vue({
    router,
    store,
    render: h => h(App),
  }).$mount('#app')


  setInterval(() =>{
    keycloak.updateToken(70).then((refreshed)=>{
      if (refreshed) {
        console.log('Token refreshed');
      } else {
        console.log('Token not refreshed, valid for '
        + Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds');
      }
    }).catch(()=>{
        console.error('Failed to refresh token');
    });
  }, 6000)

}).catch(() =>{
console.error("Authenticated Failed");
});
