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

// react-scripts 5 generates a webpack-dev-server v4 config, but webpack-dev-server is
// overridden to v5 (security fixes). Translate the v4-only options to their v5 equivalents.
const devServerV5CompatPlugin = {
  plugin: {
    overrideDevServerConfig: ({ devServerConfig }) => {
      const {
        onBeforeSetupMiddleware,
        onAfterSetupMiddleware,
        https,
        ...config
      } = devServerConfig;
      if (https) {
        config.server =
          typeof https === "object" ? { type: "https", options: https } : "https";
      }
      if (onBeforeSetupMiddleware || onAfterSetupMiddleware) {
        config.setupMiddlewares = (middlewares, devServer) => {
          if (onBeforeSetupMiddleware) onBeforeSetupMiddleware(devServer);
          if (onAfterSetupMiddleware) {
            // Run CRA's "after" middlewares after the built-in ones.
            const after = [];
            onAfterSetupMiddleware({ app: { use: (mw) => after.push(mw) } });
            after.forEach((mw, i) =>
              middlewares.push({ name: `cra-after-setup-${i}`, middleware: mw })
            );
          }
          return middlewares;
        };
      }
      return config;
    },
  },
};

// Keep any other configuration you are exporting from CRACO and add the plugin to the plugins array
module.exports = {
  plugins: [singleSpaAppPlugin, devServerV5CompatPlugin],
  webpack: {
    configure: {
      resolve: {
        fallback: {
          stream: require.resolve("stream-browserify"),
          buffer: require.resolve("buffer/"),
          net: false,  // Unfortunately, net can't be polyfilled easily in the browser.
        },
        alias: {
          "react/jsx-runtime": "react/jsx-runtime.js",
          "react/jsx-dev-runtime": "react/jsx-dev-runtime.js",
        }
      },
    },
  },
  devServer: {
    port: 3004,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
};