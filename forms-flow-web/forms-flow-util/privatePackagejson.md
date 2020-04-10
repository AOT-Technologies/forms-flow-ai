{
  "name": "@aot-technologies/formio-export",
  "version": "0.0.1",
  "description": "AOT Formio Export",
  "main": "lib/FormioExport.js",
  "directories": {
    "lib": "lib",
    "test": "test"
  },
  "scripts": {
    "build": "webpack --env dev && webpack --env build",
    "dev": "webpack --progress --colors --watch --env dev",
    "test": "mocha --require jsdom-global/register --require babel-core/register --colors ./test/*.spec.js",
    "test:watch": "mocha --require jsdom-global/register --require babel-core/register --colors -w ./test/*.spec.js"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/AOT-Technologies/formio-export.git"
  },
  "keywords": [
    "javascript",
    "formio",
    "formiojs"
  ],
  "author": "Gurumoorthy Mohan",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/AOT-Technologies/formio-export/issues"
  },
  "homepage": "https://github.com/AOT-Technologies/formio-export#readme",
  "devDependencies": {
    "babel-cli": "^6.26.0",
    "babel-core": "^6.26.3",
    "babel-eslint": "^8.2.3",
    "babel-loader": "^7.1.4",
    "babel-plugin-add-module-exports": "^0.2.1",
    "babel-preset-env": "^1.6.1",
    "chai": "^4.1.2",
    "eslint": "^4.19.1",
    "eslint-loader": "^2.0.0",
    "jsdom": "^11.12.0",
    "jsdom-global": "^3.0.2",
    "mocha": "^5.1.1",
    "webpack": "^4.41.5",
    "webpack-cli": "^3.1.2",
    "yargs": "^11.0.0"
  },
  "dependencies": {
    "js-html2pdf": "^1.1.4",
    "lodash": "^4.17.15",
    "moment": "^2.20.1"
  }
}
