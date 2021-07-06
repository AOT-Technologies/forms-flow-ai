# Usage Instructions
In the following document, we’ll describe the step by step instructions to set up a working sample in the formsflow.ai solution.

## Table of Contents
1. [Usage Instructions](#usage-instructions)
2. [Usage Instructions with examples](#usage-instructions-with-example)
    * [Freedom of Information and Protection of Privacy](#freedom-of-information-and-protection-of-privacy)
    * [Create New Business License Application](#create-new-business-license-application)
3. [Links](#links)


## Usage Instructions

> The following instructions can be followed to use formsflow.ai solution after the successful healthcheck of all formsflow.ai services.

### [STEP 1](#) Designer Task
   * Log in to http://localhost:3000 (forms-flow-web) with valid [user credentials for designer](./forms-flow-idm/keycloak/README.md#formsflow-ai-user-credentials).
   * After the log in is successful, you will be redirected to http://localhost:3000/form where you can `Create/View/Edit/Delete a form`.
   * To create a new form click on **Create Form Button**. Now you can use the Drag-and-drop forms-builder with rich UI components to create a form with ease.
   * Once the form creation is completed click on **Save & Preview Button**, you can modify the form by clicking on **Edit Button** or click on **Next Button** to proceed further at this point.
   * At this stage form designing is completed, you can click on **EDIT Button** and associate a workflow if needed.
   > Forms and workflows marked as [Internal] should not be used for association from formsflow-web.
   * After the workflow association is completed click on **Next Button** to preview and confirm.
   * You can click on **EDIT Button** and publish the form for clients to sent it for client usage.
   * Click on **SAVE Button** to completed designing a form.
   * Form designing is successfully completed, you can now **Log out** and go to [STEP 2](#) 
   
### [STEP 2](#) Client Task
   * Log in to http://localhost:3000 (forms-flow-web) with valid [user credentials for client](./forms-flow-idm/keycloak/README.md#formsflow-ai-user-credentials).
   * After the log in is successful you will be redirected to http://localhost:3000/form where you can `View and Submit a form`.
   * Click **Submit New Button** on the form which you wanted to submit.
   * The previous action will redirect you to the form, where you can fill the details and Submit.
   * Fill the details and Submit the form, You can repeat this action as per your requirement.
   * If you had associated a workflow with the form, the form will start the workflow.
   * This action is completed, you can now Log out and go to [STEP 3](#) if you have a user review mentioned in your workflow.
   
### [STEP 3](#) Reviewer Task
   * Log in to http://localhost:3000 (forms-flow-web) with valid [user credentials for reviewer](./forms-flow-idm/keycloak/README.md#formsflow-ai-user-credentials).
   * After successful login you will be redirected to http://localhost:3000/task where you can navigate to `Tasks tab` to see the tasks pending to be reviewed.
   * You can click on a particular task and review the task accordingly. There are option to **Filter Tasks** and **sorting by Created Date** to easily search the task you want.
   * On selecting a particular task there are options to modify **Assignee/ Groups / Due Date / FollowUp Date**.
   * Also you can view the **Form/ History / Diagram**
   * You can navigate to **Applications tab** to view form submissions.
   * You can View the submissions against a form by clicking on **View Submissions Button**
   * You can also submit a new form like [STEP 2](#) from the Forms Tab.
   * You can navigate to **Dashboards** tab to see the analytics of our solution
     * You can navigate to **Metrics** tab to see an overview of the total form submissions and associated application status to indicate which stage of workflow it is now.
     * You can navigate to **Insights** tab to see wonderful dashboard created in formsflow.ai analytics server.
   * Reviewer action is completed.

## Usage Instructions with examples

## Freedom of Information and Protection of Privacy

> The following instructions are using an example form from the form.io - `Freedom of Information and Protection of Privacy`. 

* The usage instructions mention the end to end flow of a form is explained for Employee Feedback Form.

### [STEP 1](#) Designer Task
* Log in to http://localhost:3000 (forms-flow-web) with valid [user credentials for designer](./forms-flow-idm/keycloak/README.md#formsflow-ai-user-credentials).
* After the log in is successful you will be redirected to http://localhost:3000/form where you can `Create / View / Edit / Delete` a form.

![image](https://user-images.githubusercontent.com/83489861/124453516-1107d380-dda5-11eb-9dba-2742cabc8582.png)

* To create a new form click on **Create Form Button**. You can use the Drag-and-drop forms-builder with rich UI components to create a form with ease.
> Employee Feedback form is already created, so we are skipping the step of creating Form.
* You can modify the form by clicking on **View/Edit Form** button and you can edit form design by clicking the **Edit Form** button or continue by moving **Next** button if form design is completed to move to the stage associating workflow to the form.

![image](https://user-images.githubusercontent.com/83489861/124475627-8d0f1500-ddbf-11eb-8ca1-5898bcc7d499.png)

* At this stage form designing is completed, you can click on **EDIT Button** and associate a workflow - One Step Approval. 

![image](https://user-images.githubusercontent.com/83489861/124475762-b6c83c00-ddbf-11eb-9911-41e55e2a9b9d.png)

* After the associate workflow is completed click on **Next Button** to Preview and Confirm.
* You can click on **EDIT Button** and publish the form for clients to sent it for client usage.

![image](https://user-images.githubusercontent.com/83489861/124475827-cba4cf80-ddbf-11eb-8b07-f8c2b23c25eb.png)

* Click on **SAVE Button** to completed designing a form.

* Form designing is successfully completed, you can now Log out and go to [STEP 2](#)

### [STEP 2](#) Client Tasks

* Log in to http://localhost:3000 (forms-flow-web) with valid [default user credentials for client](./forms-flow-idm/keycloak/README.md#formsflow-ai-user-credentials).
* After the log in is successful you will be redirected to http://localhost:3000/form where you can View and Submit a form.

![image](https://user-images.githubusercontent.com/83489861/124476700-c72ce680-ddc0-11eb-9dba-31adf9d63a5e.png)

* Click **Submit New Button** on the form which you wanted to submit.
* The previous action will redirect you to the form, where you can fill the details and Submit. Fill the details and Submit the form, You can repeat this action as per your requirement.

![image](https://user-images.githubusercontent.com/83489861/124476729-d2801200-ddc0-11eb-847d-d61b109cbc4c.png)

* If you had associated a workflow with the form, the form will start the workflow.
* This action is completed, you can now Log out and go to [STEP 3](#) if you have a user review mentioned in your workflow.
   
### [STEP 3](#) Reviewer Tasks

* Log in to http://localhost:3000 (forms-flow-web) with valid [default user credentials for reviewer](./forms-flow-idm/keycloak/README.md#formsflow-ai-user-credentials).
* After the log in is successful you will be redirected to http://localhost:3000/task.

![image](https://user-images.githubusercontent.com/83489861/124476868-fc393900-ddc0-11eb-81bf-ec75058db5df.png)

* You can navigate to Applications tab to **View the Form** submissions.

![image](https://user-images.githubusercontent.com/70306694/121731275-5a4e6580-cb0e-11eb-87ea-7516f0a7e5ab.png)

* You can View the submissions against a form by clicking on **View** button.

![image](https://user-images.githubusercontent.com/70306694/121731427-89fd6d80-cb0e-11eb-846f-31fdb917ba5d.png)

* You can even print the Form submission as a PDF which can be rendered in browser

![reviewer-print](https://user-images.githubusercontent.com/83489861/124477501-b7fa6880-ddc1-11eb-99d6-505a8b9b4017.png)


* On clicking the associated task which was recently created ie. *Manager Feedback Review(Example)*, the task detailed menu usually has three sections - **Forms**, **History**, **Diagram**


![manager landing](https://user-images.githubusercontent.com/83952803/121698577-c23f8480-caeb-11eb-9f55-16540ae80ecb.PNG)
![manager_history](https://user-images.githubusercontent.com/83952803/121698653-d5525480-caeb-11eb-9124-fd5a23efdfaa.PNG)
![manager_diagram](https://user-images.githubusercontent.com/83952803/121698637-cec3dd00-caeb-11eb-8e1f-a6e4c5f717ba.PNG)

* On claiming the task, the Manager can fill the form and submit his review.

![image](https://user-images.githubusercontent.com/70306694/121698761-f31fb980-caeb-11eb-82eb-52754632c382.png)
![image](https://user-images.githubusercontent.com/70306694/121699346-79d49680-caec-11eb-8854-86cf1b2fa755.png)
![image](https://user-images.githubusercontent.com/70306694/121699445-8eb12a00-caec-11eb-9d5f-cb595a59a4d3.png)

* On the **History** section, the form submission history can be found and the form can be viewed.

![manager_history](https://user-images.githubusercontent.com/83952803/121698653-d5525480-caeb-11eb-9124-fd5a23efdfaa.PNG)
![view_submission](https://user-images.githubusercontent.com/83952803/121700370-75f54400-caed-11eb-85b7-55ff6c9c79c2.PNG)


* On the Diagram section, the diagram highlights which state is the task currently in.
![image](https://user-images.githubusercontent.com/70306694/121700097-2e6eb800-caed-11eb-915a-c079ecb2117f.png)

* Reviewer action is completed.

## Create New Business License Application

> The following instructions are using an example form from the form.io - `Create New Business License Application`. Before using this form ensure that you have configured the
`mail.config properties` in forms-flow-bpm as mentioned [here](./forms-flow-bpm/README.md#mail-configuration)

* The usage instructions mention the end to end flow of a form is explained for Product Survey Form.

### [STEP 1](#) Designer Task
* Log in to http://localhost:3000 (forms-flow-web) with valid [user credentials for designer](./forms-flow-idm/keycloak/README.md#formsflow-ai-user-credentials).
* After the log in is successful you will be redirected to http://localhost:3000/form where you can `Create / View / Edit / Delete` a form.

![image](https://user-images.githubusercontent.com/83489861/124479964-69020280-ddc4-11eb-9739-18c44a770f76.png)

* To create a new form click on **Create Form Button**. You can use the Drag-and-drop forms-builder with rich UI components to create a form with ease.
> Product Survey form is already created, so we are skipping the step of creating Form.
* You can modify the form by clicking on **View/Edit Form** button and you can edit form design by clicking the **Edit Form** button or continue by moving **Next** button if form design is completed to move to the stage associating workflow to the form.

![image](https://user-images.githubusercontent.com/83489861/124480017-76b78800-ddc4-11eb-9b31-e0b2df759656.png)

* At this stage form designing is completed, you can click on **EDIT Button** and associate a workflow - Two Step Approval. 
> Note: Before using this workflow ensure that you have configured the `mail.config properties` in forms-flow-bpm as mentioned [here](./forms-flow-bpm/README.md#mail-configuration)

![image](https://user-images.githubusercontent.com/83489861/124480123-9058cf80-ddc4-11eb-802c-b69bfc796685.png)

* After the associate workflow is completed click on **Next Button** to Preview and Confirm.
* You can click on **EDIT Button** and publish the form for clients to sent it for client usage.

![image](https://user-images.githubusercontent.com/83489861/124480173-9ea6eb80-ddc4-11eb-9b51-cf7c1ebbdb90.png)

* Click on **SAVE Button** to completed designing a form.
* Form designing is successfully completed, you can now Log out and go to [STEP 2](#)

### [STEP 2](#) Client Tasks

* Log in to http://localhost:3000 (forms-flow-web) with valid [default user credentials for client](./forms-flow-idm/keycloak/README.md#formsflow-ai-user-credentials).
* After the log in is successful you will be redirected to http://localhost:3000/form where you can View and Submit a form.

![image](https://user-images.githubusercontent.com/83489861/124480279-b9796000-ddc4-11eb-83c5-894f8b5ea223.png)

* Click **Submit New Button** on the form which you wanted to submit.
* The previous action will redirect you to the form, where you can fill the details and Submit.

![Image 2](https://user-images.githubusercontent.com/83584866/124552424-276b6900-de51-11eb-8e15-db699c944040.PNG)

* Fill the details and Submit the form, You can repeat this action as per your requirement.

  ![Image 3](https://user-images.githubusercontent.com/83584866/124552756-9052e100-de51-11eb-9c92-64f61ee1fa3a.png)
* If you had associated a workflow with the form, the form will start the workflow.
* This action is completed, you can now Log out and go to [STEP 3](#) if you have a clerk user review mentioned in your workflow.
   
### [STEP 3](#) Reviewer Tasks (Clerk)

* Log in to http://localhost:3000 (forms-flow-web) with valid [default user credentials for Clerk](./forms-flow-idm/keycloak/README.md#formsflow-ai-user-credentials).
* After the log in is successful you will be redirected to http://localhost:3000/task.

![Image 10](https://user-images.githubusercontent.com/83584866/124553139-ffc8d080-de51-11eb-9476-46b925821b12.PNG)

* You can navigate to Applications tab to **View the Form** submissions.

![image](https://user-images.githubusercontent.com/83489861/124480666-22f96e80-ddc5-11eb-926d-bd73a9035ce7.png)

* You can View the submissions against a form by clicking on **View** button.

![9](https://user-images.githubusercontent.com/83489861/124481576-0c9fe280-ddc6-11eb-8231-619a96644a9c.png)


* You can even print the Form submission as a PDF which can be rendered in browser

![Image 7](https://user-images.githubusercontent.com/83584866/124554587-c09b7f00-de53-11eb-9014-9c47f49dfa07.PNG)

* Based on the **New Business License Application** form workflow associated, the form is supposed to be send to an email to configured valid Gmail account.
For that ensure you have configured `mail.config properties` in forms-flow-bpm as mentioned [here](./forms-flow-bpm/README.md#mail-configuration)

![image](https://user-images.githubusercontent.com/70306694/121726317-02146500-cb08-11eb-9685-9b6881db0696.png)

* The associated task can be found for the Clerk role in the **Task Menu** section
![Image 11](https://user-images.githubusercontent.com/83584866/124555053-44556b80-de54-11eb-98fd-a1b88a235e8d.PNG)
![image](https://user-images.githubusercontent.com/70306694/121726536-4e5fa500-cb08-11eb-8c03-200be34634b1.png)

* On clicking the associated task which was recently created ie. *New Business License Application with Two Step Approval*, the task detailed menu usually has three sections - **Forms**, **History**, **Diagram**
![Image 11](https://user-images.githubusercontent.com/83584866/124555279-8da5bb00-de54-11eb-86e0-e20eb1df99e3.PNG)
![Image 12](https://user-images.githubusercontent.com/83584866/124555350-9e563100-de54-11eb-96e3-02aa608362de.PNG)
![Image 13](https://user-images.githubusercontent.com/83584866/124555392-a910c600-de54-11eb-8873-b3e247d2bb8e.PNG)

* On claiming the task, the Clerk can fill the form and submit his/her review with feedback.
![image](https://user-images.githubusercontent.com/70306694/121726879-c3cb7580-cb08-11eb-968d-320fc717063d.png)
![Image 14](https://user-images.githubusercontent.com/83584866/124555664-fb51e700-de54-11eb-9c72-c2c838604fcf.PNG)

* This action is completed, you can now Log out and go to [STEP 4](#) if you have a approver user review mentioned in your workflow.

### [STEP 4](#) Reviewer Tasks (Approver)

* Log in to http://localhost:3000 (forms-flow-web) with valid [default user credentials for Approver](./forms-flow-idm/keycloak/README.md#formsflow-ai-user-credentials).
* After the log in is successful you will be redirected to http://localhost:3000/task.

![Image 10](https://user-images.githubusercontent.com/83584866/124553139-ffc8d080-de51-11eb-9476-46b925821b12.PNG)

* You can navigate to Applications tab to **View the Form** submissions.

![image](https://user-images.githubusercontent.com/83489861/124480666-22f96e80-ddc5-11eb-926d-bd73a9035ce7.png)

* You can View the submissions against a form by clicking on **View** button.

![9](https://user-images.githubusercontent.com/83489861/124481576-0c9fe280-ddc6-11eb-8231-619a96644a9c.png)


* You can even print the Form submission as a PDF which can be rendered in browser

![Image 7](https://user-images.githubusercontent.com/83584866/124554587-c09b7f00-de53-11eb-9014-9c47f49dfa07.PNG)

* Based on the **New Business License Application** form workflow associated, the form is supposed to be send to an email to configured valid Gmail account.
For that ensure you have configured `mail.config properties` in forms-flow-bpm as mentioned [here](./forms-flow-bpm/README.md#mail-configuration)

![image](https://user-images.githubusercontent.com/70306694/121726317-02146500-cb08-11eb-9685-9b6881db0696.png)

* The associated task can be found for the Approver role in the **Task Menu** section
![Image 11](https://user-images.githubusercontent.com/83584866/124555053-44556b80-de54-11eb-98fd-a1b88a235e8d.PNG)
![image](https://user-images.githubusercontent.com/70306694/121726536-4e5fa500-cb08-11eb-8c03-200be34634b1.png)

* On clicking the associated task which was recently created ie. *New Business License Application with Two Step Approval*, the task detailed menu usually has three sections - **Forms**, **History**, **Diagram**
![Image 11](https://user-images.githubusercontent.com/83584866/124555279-8da5bb00-de54-11eb-86e0-e20eb1df99e3.PNG)
![Image 12](https://user-images.githubusercontent.com/83584866/124555350-9e563100-de54-11eb-96e3-02aa608362de.PNG)
![Image 13](https://user-images.githubusercontent.com/83584866/124555392-a910c600-de54-11eb-8873-b3e247d2bb8e.PNG)

* On claiming the task, the Approver can fill the form and submit his/her review with feedback.
![image](https://user-images.githubusercontent.com/70306694/121726879-c3cb7580-cb08-11eb-968d-320fc717063d.png)
![Image 14](https://user-images.githubusercontent.com/83584866/124555664-fb51e700-de54-11eb-9c72-c2c838604fcf.PNG)

* This action is completed,  New Business License Application is completed it's workflow.

## Links

* [Web site](https://formsflow.ai/)
* [Youtube Link](https://youtu.be/_H-P3Av3gqg)

