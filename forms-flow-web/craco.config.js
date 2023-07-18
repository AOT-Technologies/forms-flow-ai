const SingleSpaAppcracoPlugin = require("craco-plugin-single-spa-app-aot");

const shouldMinimize = process.env.NODE_ENV == "production";

const singleSpaAppPlugin = {
  plugin: SingleSpaAppcracoPlugin,
  options: {
    orgName: "formsflow",
    projectName: "formsflow-web",
    entry: "src/single-spa-index.js", //defaults to src/index.js,
    orgPackagesAsExternal: true, // defaults to false. marks packages that has @my-org prefix as external so they are not included in the bundle
    reactPackagesAsExternal: true, // defaults to true. marks react and react-dom as external so they are not included in the bundle
    minimize: shouldMinimize, // defaults to false, sets optimization.minimize value
    outputFilename: "forms-flow-web.js", // defaults to the values set for the "orgName" and "projectName" properties, in this case "my-org-my-app.js"
  },
};

// Keep any other configuration you are exporting from CRACO and add the plugin to the plugins array
module.exports = {
  plugins: [singleSpaAppPlugin],
  devServer: {
    port: 3004,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
};
