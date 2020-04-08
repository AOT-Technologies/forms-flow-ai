window.camTasklistConf = {
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

