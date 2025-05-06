# formsflow.ai Web Application

![React](https://img.shields.io/badge/React-17.0.2-blue)

**formsflow.ai** delivers a modern Progressive Web Application built using **React (v17.0.2)** and **Create React App**. It also integrates with the [form.io](https://github.com/formio/formio) platform (v4.21.4) to render dynamic forms.

This React-based library allows you to render forms and manage workflows using the capabilities of the **form.io** platform.

In addition to the React UI, **formsflow.ai** also provides a Vue.js-based web interface for seamless integration with Vue-based applications. For more details, check out the [formsflow-ai-extensions repository](https://github.com/AOT-Technologies/forms-flow-ai-extensions/tree/master/camunda-formio-tasklist-vue).

You can easily integrate the Vue extension into your project by installing our [official npm package](https://www.npmjs.com/package/camunda-formio-tasklist-vue).

This component is ideal for creating customized web applications that combine powerful form rendering with workflow automation.

### Installation and features

Check out the [installation documentation](https://aot-technologies.github.io/forms-flow-installation-doc/) for installation instructions and [features documentation](https://aot-technologies.github.io/forms-flow-ai-doc) to explore features and capabilities in detail.


### Code coverage
  * Test cases for the files are provided at forms-flow-web using [testing-library/jest-dom](https://testing-library.com/docs/ecosystem-jest-dom/) , [testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) , [msw](https://mswjs.io/) and [redux-mock-store](https://www.npmjs.com/package/redux-mock-store).
  * `cd {Your Directory}/forms-flow-ai/forms-flow-web`.
  * Test files are available at `forms-flow-ai\forms-flow-web\src\_tests_`
  * Run the command `npm run coverage` to get the total coverage and for individual files run `npm test --<test file name>`.
  * Total code coverage can obtain by opening `forms-flow-ai\forms-flow-web\coverage\lcov-report\index.html` with browser.

### Internationalization
  * Default language 'English' can be changed to other languages according to the   user.
  * The languages currently provided are `Chinese,Portuguese,French,German, Bulgarian and Spanish`.
  * User can add more languages by following the steps mentioned [here](https://aot-technologies.github.io/forms-flow-ai-doc/#language)

## forms-flow-web Events
This section elaborates events used in forms-flow-web.
The Form.io renderer uses the [EventEmitter3](https://github.com/primus/eventemitter3) library to manage all of the event handling that occurs within the renderer.
Custom events are triggered for button components and are fired when they are clicked. More details are [here](https://docs.form.io/developers/form-renderer#form-events)

| **Name**            | **Description**                                                                                                                                          | **Arguments**                                                                                      | **Example**                                                                                                 |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| `reloadTasks`       | - Used in the task page  <br> - Triggered for button components  <br> - Refresh the Task List and remove the selected task from RHS.                    | - `type`: The configured event type                                                                 | `form.emit('customEvent', { type: "reloadTasks" });`                                                        |
| `reloadCurrentTask` | - Used in the task page  <br> - Triggered for button components  <br> - Refreshes the current task selected                                              | - `type`: The configured event type                                                                 | `form.emit('customEvent', { type: "reloadCurrentTask" });`                                                  |
| `customSubmitDone`  | - Used in the create form page  <br> - Triggered for button components  <br> - Similar to submit button to implement custom logic                        | - `type`: The configured event type                                                                 | `form.emit('customEvent', { type: "customSubmitDone" });`                                                   |
| `actionComplete`    | - Triggered for button components                                                                                                                        | - `type`: The configured event type  <br> - `component`: The component JSON  <br> - `actionType`: Form submit action values | `form.emit('customEvent', { type: "actionComplete", component: component, actionType: actionType });`      |
| `cancelSubmission`  | - Used in the create form page  <br> - Triggered for button components  <br> - Used for canceling current submission and going back to Form List Page   | - `type`: The configured event type                                                                 | `form.emit('customEvent', { type: "cancelSubmission" });`                                                   |
