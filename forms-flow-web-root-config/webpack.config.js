const { merge } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const DefinePlugin = require("webpack/lib/DefinePlugin");
require("dotenv").config({ path: "./.env" });

module.exports = (webpackConfigEnv, argv) => {
  const orgName = "formsflow";
  const defaultConfig = singleSpaDefaults({
    orgName,
    projectName: "root-config",
    webpackConfigEnv,
    argv,
    disableHtmlGeneration: true,
  });

  return merge(defaultConfig, {
    // modify the webpack config however you'd like to by adding to this object
    plugins: [
      new HtmlWebpackPlugin({
        inject: false,
        template: "src/index.ejs",
        templateParameters: {
          isLocal: webpackConfigEnv && webpackConfigEnv.isLocal,
          orgName,
        },
      }),
      new CopyPlugin({
        patterns: [
          {
            from: "./public/",
            globOptions: {
              dot: true,
              gitignore: true,
              ignore: ["**/index.html"],
            },
          },
        ],
      }),
      new DefinePlugin({
        "process.env": JSON.stringify(process.env),
      }),
    ],
  });
};
