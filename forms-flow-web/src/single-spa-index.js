import React from "react";
import ReactDOM from "react-dom";
import singleSpaReact from "single-spa-react";
import App from "./components/App";
import StoreService from "./services/StoreService";
import { featureFlags } from "./featureToogle";
import { FlagsProvider } from "flagged";
import { Formio, Components } from "@aot-technologies/formio-react";
import { AppConfig } from "./config";
import "./resourceBundles/i18n.js";

if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === "object") {
  for (let [key, value] of Object.entries(
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__
  )) {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] =
      typeof value == "function" ? () => {} : null;
  }
}
Formio.setProjectUrl(AppConfig.projectUrl);
Formio.setBaseUrl(AppConfig.apiUrl);

// Set custom formio elements - Code splitted
import(
  "@aot-technologies/formsflow-formio-custom-elements/dist/customformio-ex"
).then((FormioCustomEx) => {
  Components.setComponents(FormioCustomEx.components);
});

// Head component to override styling
const Head = () => {
  React.useEffect(() => {
    // Create or update style element for single-spa overrides
    let styleElement = document.getElementById("single-spa-style-overrides");

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "single-spa-style-overrides";
      document.head.appendChild(styleElement);
    }

    // Add your custom CSS overrides here
    styleElement.textContent = `
  
      .formio-form,.form-builder  {
  transform: scale(0.95);
  transform-origin: top;
  zoom: 0.9 !important;
}

.formio-form .form-group, 
.formio-builder-form .form-group {
  margin-bottom: 0 !important;
}

.formio-component {
  padding-top: .25rem !important;
}
.formio-form,
.formio-wizard-nav-container.list-inline {
  padding-top: 0.25rem !important;
}

.col-form-label {
  padding-bottom: 0 !important;
}
    `;

    return () => {
      // Cleanup on unmount
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, []);

  return null;
};

const createRootComponent = (props) => {
  const { publish, subscribe, getKcInstance } = props;
  const store = StoreService.configureStore();
  const history = StoreService.history;
  return (
    <FlagsProvider features={featureFlags}>
      {featureFlags.enableCompactViewForm && <Head />}
      <App {...{ store, history, publish, subscribe, getKcInstance }} />
    </FlagsProvider>
  );
};

const reactLifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: createRootComponent,
  errorBoundary() {
    return <div>This renders when a catastrophic error occurs</div>;
  },
  renderType: "render",
});

export const { bootstrap, mount, unmount } = reactLifecycles;
