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

![Image 1](https://user-images.githubusercontent.com/83584866/124597717-6d402580-de81-11eb-9b15-6e84bec7a8b3.PNG)

* If you had associated a workflow with the form, the form will start the workflow.
* This action is completed, you can now Log out and go to [STEP 3](#) if you have a user review mentioned in your workflow.
   
### [STEP 3](#) Reviewer Tasks

* Log in to http://localhost:3000 (forms-flow-web) with valid [default user credentials for reviewer](./forms-flow-idm/keycloak/README.md#formsflow-ai-user-credentials).
* After the log in is successful you will be redirected to http://localhost:3000/task.

![Image 9](https://user-images.githubusercontent.com/83584866/124597833-92349880-de81-11eb-8d47-6f724627a651.PNG)

* You can navigate to Applications tab to **View the Form** submissions.

![Image 10](https://user-images.githubusercontent.com/83584866/124597926-b001fd80-de81-11eb-91ae-08002d5202cb.PNG)

* You can View the submissions against a form by clicking on **View** button.

![Image 26](https://user-images.githubusercontent.com/83584866/124598386-2acb1880-de82-11eb-8cb4-fe3249d3de93.PNG)

* You can even print the Form submission as a PDF which can be rendered in browser

![Image 6](https://user-images.githubusercontent.com/83584866/124598443-3cacbb80-de82-11eb-8a19-bfe379978864.PNG)


* On clicking the associated task which was recently created ie. *Freedom of Information and Protection of Privacy*, the task detailed menu usually has three sections - **Forms**, **History**, **Diagram**


![Image 15](https://user-images.githubusercontent.com/83584866/124598608-6f56b400-de82-11eb-9409-dcba892441c8.PNG)
![Image 16](https://user-images.githubusercontent.com/83584866/124598662-7a114900-de82-11eb-8653-d370bc3aa7c9.PNG)
![Image 17](https://user-images.githubusercontent.com/83584866/124598701-84cbde00-de82-11eb-9773-c84afbbd812c.PNG)

* On claiming the task, the Reviewer can fill the form and submit his review.

![Image 18](https://user-images.githubusercontent.com/83584866/124598773-9b723500-de82-11eb-8070-5551ae2f1398.PNG)
![Image 19](https://user-images.githubusercontent.com/83584866/124598911-c3619880-de82-11eb-85a2-f3f5f065ba9c.PNG)
![Image 20](https://user-images.githubusercontent.com/83584866/124598962-cfe5f100-de82-11eb-8938-4309efd872fb.PNG)

* On the **Application** section, the form submission history can be found and the form can be viewed.

![Image 21](https://user-images.githubusercontent.com/83584866/124599112-f015b000-de82-11eb-87ff-89ac9fb95d24.PNG)
![Image 24](https://user-images.githubusercontent.com/83584866/124599317-2a7f4d00-de83-11eb-8bc1-5215bb9add03.PNG)
![Image 25](https://user-images.githubusercontent.com/83584866/124599412-45ea5800-de83-11eb-8b8b-ae87ad2172d3.PNG)
![Image 26](https://user-images.githubusercontent.com/83584866/124599471-54387400-de83-11eb-8e53-ba9319748d2f.PNG)

* Reviewer action is completed.

## Create New Business License Application

> The following instructions are using an example form from the form.io - `Create New Business License Application`. Before using this form ensure that you have configured the
`mail.config properties` in forms-flow-bpm as mentioned [here](./forms-flow-bpm/README.md#mail-configuration)

* The usage instructions mention the end to end flow of a form is explained for New Business License Application.

### [STEP 1](#) Designer Task
* Log in to http://localhost:3000 (forms-flow-web) with valid [user credentials for designer](./forms-flow-idm/keycloak/README.md#formsflow-ai-user-credentials).
* After the log in is successful you will be redirected to http://localhost:3000/form where you can `Create / View / Edit / Delete` a form.

![image](https://user-images.githubusercontent.com/83489861/124479964-69020280-ddc4-11eb-9739-18c44a770f76.png)

* To create a new form click on **Create Form Button**. You can use the Drag-and-drop forms-builder with rich UI components to create a form with ease.
> New Business License Application form is already created, so we are skipping the step of creating Form.
* You can modify the form by clicking on **View/Edit Form** button and you can edit form design by clicking the **Edit Form** button or continue by moving **Next** button if form design is completed to move to the stage associating workflow to the form.

![image](https://user-images.githubusercontent.com/83489861/124480017-76b78800-ddc4-11eb-9b31-e0b2df759656.png)

* At this stage form designing is completed, you can click on **EDIT Button** and associate a workflow - Two Step Approval. 

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

![Image 12](https://user-images.githubusercontent.com/83584866/124565163-5be62180-de5f-11eb-8115-680d3e4fe8cc.PNG)

* You can View the submissions against a form by clicking on **View** button.

![Image 17](https://user-images.githubusercontent.com/83584866/124565303-8506b200-de5f-11eb-889b-3710d08d62fa.PNG)


* You can even print the Form submission as a PDF which can be rendered in browser

![Image 7](https://user-images.githubusercontent.com/83584866/124565427-a6679e00-de5f-11eb-9fe4-266ba57ad0c3.PNG)

* Based on the **New Business License Application** form workflow associated, the form is supposed to be send to an email to configured valid Gmail account.
For that ensure you have configured `mail.config properties` in forms-flow-bpm as mentioned [here](./forms-flow-bpm/README.md#mail-configuration)

![Image 42](https://user-images.githubusercontent.com/83584866/124578912-46c3bf80-de6c-11eb-9bc4-03f24150a31d.PNG)

* The associated task can be found for the Clerk role in the **Task Menu** section
* On clicking the associated task which was recently created ie. *New Business License Application with Two Step Approval*, the task detailed menu usually has three sections - **Forms**, **History**, **Diagram**
![Image 18](https://user-images.githubusercontent.com/83584866/124566028-4a514980-de60-11eb-9eda-890aa7bf32f5.PNG)
![Image 19](https://user-images.githubusercontent.com/83584866/124566338-94d2c600-de60-11eb-8d17-552bbd2c766f.PNG)
![Image 20](https://user-images.githubusercontent.com/83584866/124566434-aa47f000-de60-11eb-964d-195d06d8a9eb.PNG)

* On claiming the task, the Clerk can fill the form and submit his/her review with feedback.
![Image 21](https://user-images.githubusercontent.com/83584866/124566523-c0ee4700-de60-11eb-8d27-7b46f0a856e7.PNG)
![Image 48](https://user-images.githubusercontent.com/83584866/124577274-bb95fa00-de6a-11eb-882f-2bcf8aeb3f0a.PNG)

* This action is completed, you can now Log out and go to [STEP 4](#) if you have an approver user review mentioned in your workflow.

### [STEP 4](#) Reviewer Tasks (Approver)

* Log in to http://localhost:3000 (forms-flow-web) with valid [default user credentials for Approver](./forms-flow-idm/keycloak/README.md#formsflow-ai-user-credentials).
* After the log in is successful you will be redirected to http://localhost:3000/task.

![Image 54](https://user-images.githubusercontent.com/83584866/124575685-3a8a3300-de69-11eb-92dc-267d84c29cb0.PNG)

* You can navigate to Applications tab to **View the Form** submissions.

![Image 55](https://user-images.githubusercontent.com/83584866/124575815-57266b00-de69-11eb-8c64-1d9df0e10c87.PNG)

* You can View the submissions against a form by clicking on **View** button.

![Image 56](https://user-images.githubusercontent.com/83584866/124575886-6ad1d180-de69-11eb-9665-b535939f5a9b.PNG)


* You can even print the Form submission as a PDF which can be rendered in browser

![Image 57](https://user-images.githubusercontent.com/83584866/124576102-9e146080-de69-11eb-9157-af43d6a2a245.PNG)

* Based on the **New Business License Application** form workflow associated, the form is supposed to be send to an email to configured valid Gmail account.
For that ensure you have configured `mail.config properties` in forms-flow-bpm as mentioned [here](./forms-flow-bpm/README.md#mail-configuration)

![Image 60](https://user-images.githubusercontent.com/83584866/124578694-10864000-de6c-11eb-8c90-b644511d9565.PNG)

* The associated task can be found for the Approver role in the **Task Menu** section
* On clicking the associated task which was recently created ie. *New Business License Application with Two Step Approval*, the task detailed menu usually has three sections - **Forms**, **History**, **Diagram**

![Image 62](https://user-images.githubusercontent.com/83584866/124576463-f2b7db80-de69-11eb-88ca-1927e2418409.PNG)
![Image 63](https://user-images.githubusercontent.com/83584866/124576519-02cfbb00-de6a-11eb-8111-8e89236186e3.PNG)
![Image 64](https://user-images.githubusercontent.com/83584866/124576585-124f0400-de6a-11eb-98dc-b46b626c2a8c.PNG)

* On claiming the task, the Approver can fill the form and submit his/her review with feedback.
![Image 65](https://user-images.githubusercontent.com/83584866/124576691-2c88e200-de6a-11eb-88ad-f73496b6e265.PNG)
![Image 66](https://user-images.githubusercontent.com/83584866/124576734-3874a400-de6a-11eb-8396-13c31986b0f2.PNG)

* This action is completed,  New Business License Application is completed it's workflow.

## Links

* [Web site](https://formsflow.ai/)
* [Youtube Link](https://youtu.be/_H-P3Av3gqg)

