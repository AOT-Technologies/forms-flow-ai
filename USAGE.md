# Usage Instructions
In the following document, we’ll describe about the step by step instructions to set up a working sample in formsflow.ai solution.

## Table of Contents
1. [Usage Instructions](#usage-instructions)
2. [Usage Instructions with example](#usage-instructions-with-example)
3. [Links](#links)


## Usage Instructions

> The following instructions can be followed to use formsflow.ai solution after the successful healthcheck of all formsflow.ai services.

### [STEP 1](#) Designer Task
   * Log in to http://localhost:3000 (forms-flow-web) with valid [default user credentials for designer](./forms-flow-idm/keycloak/README.md#formsflow-ai-user-credentials).
   * After the log in is successful you will be redirected to http://localhost:3000/form where you can `Create / View / Edit / Delete a form`.
   * To create a form you can click on **Create Form Button** where you can use the integrated form.io library to create a form with ease.
   * Once the form creation is completed click on **Save & Preview Button**, you can modify the form by clicking on **Edit Button** or click on **Next Button** to proceed further at this point.
   * At this stage form designing is completed, you can click on **EDIT Button** and associate a workflow if needed.
   * After the associate workflow is completed click on **Next Button** to preview and confirm.
   * You can click on **EDIT Button** and publish the form for clients to sent it for client usage.
   * Click on **SAVE Button** to completed designing a form.
   * Form designing is successfully completed, you can now **Log out** and go to [STEP 2](#) 
   
### [STEP 2](#) Client Task
   * Log in to http://localhost:3000 (forms-flow-web) with valid [default user credentials for client](./forms-flow-idm/keycloak/README.md#formsflow-ai-user-credentials).
   * After the log in is successful you will be redirected to http://localhost:3000/form where you can `View and Submit a form`.
   * Click **Submit New Button** on the form which you wanted to submit.
   * The previous action will redirect you to the form, where you can fill the details and Submit.
   * Fill the details and Submit the form, You can repeat this action as per your requirement.
   * If you had associated a workflow with the form, the form will start the workflow.
   * This action is completed, you can now Log out and go to [STEP 3](#) if you have a user review mentioned in your workflow.
   
### [STEP 3](#) Reviewer Task
   * Log in to http://localhost:3000 (forms-flow-web) with valid [default user credentials for reviewer](./forms-flow-idm/keycloak/README.md#formsflow-ai-user-credentials).
   * After successful login you will be redirected to http://localhost:3000/task where you can navigate to `Tasks tab` to see the tasks pending to be reviewed.
   * You can click on a particular task and review the task accrodingly. There are option to **Filter Tasks** and **sorting by Created Date** to easily search the task you want.
   * On selecting a particular task there are options to modify **Assignee/ Groups / Due Date / FollowUp Date**.
   * Also you can view the **Form/ History / Diagram**
   * You can navigate to **Applications tab** to view form submissions.
   * You can View the submissions against a form by clicking on **View Submissions Button**
   * You can also submit a new form like [STEP 2](#) from the Forms Tab.
   * You can navate to **Dashboards** tab to see the analytics of our solution
     * You can navigate to **Metrics** tab to see an overview of the total form submissions and associated application status to indicate which stage of workflow it is now.
     * You can navigate to **Insights** tab to see wonderful dashboard created in formsflow.ai analytics server.
   * Reviewer action is completed.

## Usage Instructions with example

> The following instructions are using an example form from the form.io - FeedBack form

* End to end flow of a form is explained below using eg: Feedback form.

### [STEP 1](#) Designer Task
* Log in to http://localhost:3000 (forms-flow-web) with valid [default user credentials for designer](./forms-flow-idm/keycloak/README.md#formsflow-ai-user-credentials).
* After the log in is successful you will be redirected to http://localhost:3000/form where you can Create / View / Edit / Delete a form.

<!-- ![Image 1](./.images/designer-landing.PNG) -->
![image](https://user-images.githubusercontent.com/70306694/121669233-be026f80-cac9-11eb-89df-2be9f3c5f939.png)

* To create a form you can click on **Create Form Button** where you can use the integrated form.io library to create a form with ease.
> Product Survey form is already created, so we are skipping the step of creating Form.
* You can modify the form by clicking on **View/Edit Form** button and you can edit form design by clicking the **Edit Form** button or continue by moving next if Form design is completed.

<!-- ![Image 2](./.images/designer-feedback-1.PNG) -->
![image](https://user-images.githubusercontent.com/70306694/121670032-a7a8e380-caca-11eb-9729-ed7a5adf2436.png)


* At this stage form designing is completed, you can click on **EDIT Button** and associate a workflow - Product Survey Administrator with Notification(Example).

<!-- ![Image 3](./.images/designer-workflow.PNG) -->
![image](https://user-images.githubusercontent.com/70306694/121670495-1ede7780-cacb-11eb-8f3d-53e2a004e5aa.png)


* After the associate workflow is completed click on **Next Button** to Preview and Confirm.
* You can click on **EDIT Button** and publish the form for clients to sent it for client usage.

<!-- ![Image 4](./.images/designer-publish.PNG) -->
![image](https://user-images.githubusercontent.com/70306694/121671914-c7410b80-cacc-11eb-8c4c-f7fe8a8f2bbd.png)


* Click on **SAVE Button** to completed designing a form.

<!-- ![Image 4](./.images/designer-final-submit.PNG) -->
![image](https://user-images.githubusercontent.com/70306694/121672045-f35c8c80-cacc-11eb-831e-8c17c2050fae.png)

* Form designing is successfully completed, you can now Log out and go to [STEP 2](#)

### [STEP 2](#) Client Tasks

* Log in to http://localhost:3000 (forms-flow-web) with valid [default user credentials for client](./forms-flow-idm/keycloak/README.md#formsflow-ai-user-credentials).
* After the log in is successful you will be redirected to http://localhost:3000/form where you can View and Submit a form.

![Image 5](./.images/client-landing.PNG)

* Click **Submit New Button** on the form which you wanted to submit.
* The previous action will redirect you to the form, where you can fill the details and Submit.

![Image 6](./.images/client-submission.PNG)
![Image 7](./.images/client-submission-success.PNG)

* Fill the details and Submit the form, You can repeat this action as per your requirement.
* If you had associated a workflow with the form, the form will start the workflow.
* This action is completed, you can now Log out and go to [STEP 3](#) if you have a user review mentioned in your workflow.
   
### [STEP 3](#) Reviewer Tasks

* Log in to http://localhost:3000 (forms-flow-web) with valid [default user credentials for reviewer](./forms-flow-idm/keycloak/README.md#formsflow-ai-user-credentials).
* After the log in is successful you will be redirected to http://localhost:3000/task where you can navigate to Applications tab to View submissions.

![Image 8](./.images/reviewer-landing.PNG)

* You can View the submissions against a form by clicking on **View Submissions Button**

![Image 9](./.images/reviewer-view-forms.PNG)
![Image 10](./.images/reviewer-form-view.PNG)
![Image 11](./.images/reviewer-print.PNG)

* You can also submit a new form like [STEP 2](#) from the Forms tab.
* Reviewer action is completed.

## Links

* [Web site](https://formsflow.ai/)
* [Youtube Link](https://youtu.be/_H-P3Av3gqg)

