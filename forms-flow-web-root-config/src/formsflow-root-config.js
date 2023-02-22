import { registerApplication, start } from "single-spa";
import {
  constructApplications,
  constructRoutes,
  constructLayoutEngine,
} from "single-spa-layout";
import PubSub from "pubsub-js";
import microfrontendLayout from "./microfrontend-layout.html";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const publish = (event, data) => PubSub.publish(event, data)
const subscribe = (event, callback) => PubSub.subscribe(event, callback)
let instance = null;
subscribe("FF_AUTH", (msg, data)=>{
  instance = data
})
const getKcInstance = ()=> instance

if(window._env_?.CUSTOM_THEME_URL){
  fetch(window._env_?.CUSTOM_THEME_URL)
  .then((response) => response.json())
  .then((data) => {
    if(typeof(data) == "object"){
      for (let property in data){
        document.documentElement.style.setProperty(property, data[property])
      }
    }
  });
}

// Register service worker and if new changes skip waiting and activate new service worker
serviceWorkerRegistration.register({
  onUpdate: registration => {
    const waitingServiceWorker = registration.waiting;

    if (waitingServiceWorker) {
      waitingServiceWorker.addEventListener("statechange", event => {
        if (event.target.state === "activated") {
          window.location.reload();
        }
      });
      waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
    }
  }
});

const routes = constructRoutes(microfrontendLayout);
const applications = constructApplications({
  routes,
  loadApp({ name }) {
    return System.import(name);
  },
});
const layoutEngine = constructLayoutEngine({ routes, applications });

applications.forEach((mfe)=>registerApplication({
  ...mfe,
  customProps: {
    publish,
    subscribe,
    getKcInstance
  }
}));
layoutEngine.activate();
start();
