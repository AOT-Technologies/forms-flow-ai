# formsflow.ai Web Application

![React](https://img.shields.io/badge/React-17.0.2-blue)
![webpack](https://img.shields.io/badge/webpack-5.94.0-blue)


The formsflow.ai web root config manages micro-front ends at a single place built with [create-single-spa](https://single-spa.js.org/docs/create-single-spa), 
which can be used to create new front-end modules and migrate existing projects. All front-end modules require a root config to work. 
The root config is responsible for orchestrating the modules, routing, and distributing the configurations.

# Integrate micro front-end modules into host applications

  Integrating formsflow.ai front-end modules into a host application requires the host application to have a micro front-end architecture and we already have hosted S3 artifacts to support easy integration. In order to make use of our hosted modules the host application must support the System.register module format (Already taken care of if following the above-mentioned steps).
  The development experience would be similar to that of a SPA only difference would be the root config. The root config should be running locally and the module that is under development and all other modules can be hosted instances.

  The root config will be managing all environment variables so any new variables should be added to the root config, make sure to update the config.template.js file in the public folder since the template will be used to set the variables to the window so that all modules can access the config values.

  Note: Do not expose any secrets or variables that impact security to the root config.
  
  Conceptual Diagram:
  
  ![image](https://user-images.githubusercontent.com/93634377/230897362-3ef331d4-cf89-42b2-9634-cf2fc293c9a5.png)
  
  Notes:
  
   - If someone wants the modules to be active when the path to be matched comes after a base path, make use of 
      the [base](https://single-spa.js.org/docs/layout-definition#single-spa-router) attribute.
   - If anyone intends to use our hosted modules rather than building their own please make sure the `orgName` should be 
     same across all applications. So for using hosted instances make sure `formsflow` should be the `orgName` when creating root config and modules. [Ref](https://single-spa.js.org/docs/getting-started-overview/#create-a-root-config)
   - For production, we recommend pushing the host module artifacts to object storage and serving the root config with any web server, 
     we already containerized the root config implementation of formsflow.ai. [Ref](https://github.com/AOT-Technologies/forms-flow-ai/tree/master/forms-flow-web-root-config)


### Integrate new modules into formsflow.ai 

Integrating new module into formsflow is straight forward but the module should have the following prerequisites.

   - The module should be of `System.register` format.
   - The module should implement single-spa lifecycle methods. (Not applicable if built with `create-single-spa`) [Ref](https://single-spa.js.org/docs/building-applications/)
   - If the module is built with frameworks other than React then the import maps should be updated with System.register versions of the libraries.
   [Ref](https://github.com/esm-bundle)
   - Update the import maps with the new module.
   - Update the layout and specify the path to activate the module (Not applicable for utility modules).
   - We recommend using single-spa CLI to create new module. 

### Additional reference

Check out the [installation documentation](https://aot-technologies.github.io/forms-flow-installation-doc/) for installation instructions and [features documentation](https://aot-technologies.github.io/forms-flow-ai-doc) to explore features and capabilities in detail.

