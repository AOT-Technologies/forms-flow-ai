if (window.location.href.startsWith("https://test-")) {
  document.querySelector("[cam-widget-header]").style.backgroundColor = "orange";
} else if (window.location.href.startsWith("https://dev-")) {
  document.querySelector("[cam-widget-header]").style.backgroundColor = "green";
} else if (window.location.href.startsWith("http://localhost")) {
  document.querySelector("[cam-widget-header]").style.backgroundColor = "grey";
}

window.camCockpitConf = {
  customScripts: {
    // AngularJS module names
    ngDeps: ['custom-logout'],
    // RequireJS configuration for a complete configuration documentation see:
    // http://requirejs.org/docs/api.html#config
    deps: ['jquery', 'custom-logout'],
    paths: {
      'custom-logout': 'custom/logout'
    }
  },

  app: {
    name: 'Process Engine',
    vendor: ' '
  }
};

export default {
    bpmnJs: {
        additionalModules: [
            //     // if you have a folder called 'my-custom-module' (in the 'cockpit' folder)
            //     // with a file called 'module.js' in it
            //     'my-custom-module/module'
            'scripts/robot-module.js'
        ],
    },
    customScripts: [
        'custom/logout',
        'scripts/definition-historic-activities.js',
        'scripts/instance-historic-activities.js',
        'scripts/instance-route-history.js'
    ],
    disableWelcomeMessage: true,
    // userOperationLogAnnotationLength: 5000,
    previewHtml: true
}
