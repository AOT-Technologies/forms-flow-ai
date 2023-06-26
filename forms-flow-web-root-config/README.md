# Integrate micro front-end modules into host applications.

The formsflow.ai micro-front ends are built with [create-single-spa](https://single-spa.js.org/docs/create-single-spa), 
which can be used to create new front-end modules and migrate existing projects. All front-end modules require a root config to work. 
The root config is responsible for orchestrating the modules, routing, and distributing the configurations.

Please follow the appropriate case for the integration.

Case 1: Creating a brand new application where formsflow.ai modules are to be integrated.

We recommend using the micro-front-end architecture for such projects since formsflow.ai modules can be registered easily. 
We recommend using single-spa and System.js import maps for the new projects. Single-spa manages micro-front-end routing and lifecycle methods such as mount and unmount. 
Import maps are used for the runtime loading of different modules.

Steps:

   1. Setup root config for the project
   Create-single-spa CLI can be used to quickly setup the root config, and also find the root config implementation for the [formsflow.ai](https://github.com/AOT-Technologies/forms-flow-ai/tree/5.2.0-alpha/forms-flow-web-root-config)
   
   ![image](https://user-images.githubusercontent.com/93634377/230896120-8a6ba74d-32ea-4c35-9d11-2d2add4435af.png)
   
   2. Root config should not contain any business logic, so create a new module using create-single-spa this time select the single-spa application.

   ![image](https://user-images.githubusercontent.com/93634377/230896293-40d29125-af06-49ed-b927-dcfe6792da5a.png)

  Select the appropriate options in the following prompts where it is flexible to select the framework of choice and language preferences etc.  

  This single-spa application is the same as a typical SPA and this can be an entire web app or part of the application, 
  this application would be managed by the root configuration.
  
  3. Register the newly created application into the root config.
  If you are using the single spa layout engine it is as simple as adding a new path to the layout template after updating the import map.
  
  ![image](https://user-images.githubusercontent.com/93634377/230896459-1422cf83-15b5-4975-aad0-4d9c68c37014.png)
  
  ![image](https://user-images.githubusercontent.com/93634377/230896598-a600ae60-7c77-4133-8b11-8c9581e3669d.png)

  4. Add the required formsflow.ai module in the same way, the following modules are available from formsflow.ai 
      - formsflow-admin
      - formsflow-web
      - formsflow-nav
      - formsflow-service
      - formsflow-theme
   
  5. Please make sure to include the service module when including any of the modules.


Case 2: Integration with the existing host application.

Steps:

  1. Follow the steps in creating the root config.
  2. Migrate the existing application into a micro-front-end application.
  create-single-spa CLI can be used to create the boilerplate application and the business logic can be migrated to the new structure.
  For applications built with build tools like create-react-app, the recommended approach would be to use tools like the [CRACO](https://github.com/AOT-Technologies/craco-plugin-single-spa-application) plugin 
  to apply configuration overrides. Find the [link](https://github.com/AOT-Technologies/forms-flow-ai/tree/5.2.0-alpha/forms-flow-web) to the reference.

  3. Continue Step 4 from Case 1. 
  
  Summary:
  
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
     we already containerized the root config implementation of formsflow.ai. [Ref](https://github.com/AOT-Technologies/forms-flow-ai/tree/5.2.0-alpha/forms-flow-web-root-config)


# Integrate new modules into formsflow.ai 

Integrating new module into formsflow is straight forward but the module should have the following prerequisites.

   - The module should be of `System.register` format.
   - The module should implement single-spa lifecycle methods. (Not applicable if built with `create-single-spa`) [Ref](https://single-spa.js.org/docs/building-applications/)
   - If the module is built with frameworks other than React then the import maps should be updated with System.register versions of the libraries.
   [Ref](https://github.com/esm-bundle)
   - Update the import maps with the new module.
   - Update the layout and specify the path to activate the module (Not applicable for utility modules).
   - We recommend using single-spa CLI to create new module. 
