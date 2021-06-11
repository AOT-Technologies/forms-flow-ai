![manager landing](https://user-images.githubusercontent.com/83952803/121698487-af2cb480-caeb-11eb-86da-c9b3870246b2.PNG)
# Usage Instructions
In the following document, we’ll describe about the step by step instructions to set up a working sample in formsflow.ai solution.

## Table of Contents
1. [Usage Instructions](#usage-instructions)
2. [Usage Instructions with build-in examples](#usage-instructions-with-example)
3. [Links](#links)


## Usage Instructions

> The following instructions can be followed to use formsflow.ai solution after the successful healthcheck of all formsflow.ai services.

### [STEP 1](#) Designer Task
   * Log in to http://localhost:3000 (forms-flow-web) with valid [user credentials for designer](./forms-flow-idm/keycloak/README.md#formsflow-ai-user-credentials).
   * After the log in is successful, you will be redirected to http://localhost:3000/form where you can `Create/View/Edit/Delete a form`.
   * To create a new form click on **Create Form Button**. Now you can use the Drag-and-drop forms-builder with rich UI components to create a form with ease.
   * Once the form creation is completed click on **Save & Preview Button**, you can modify the form by clicking on **Edit Button** or click on **Next Button** to proceed further at this point.
   * At this stage form designing is completed, you can click on **EDIT Button** and associate a workflow if needed.
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
   * You can navate to **Dashboards** tab to see the analytics of our solution
     * You can navigate to **Metrics** tab to see an overview of the total form submissions and associated application status to indicate which stage of workflow it is now.
     * You can navigate to **Insights** tab to see wonderful dashboard created in formsflow.ai analytics server.
   * Reviewer action is completed.

## Usage Instructions with example

> The following instructions are using an example form from the form.io - FeedBack form

* End to end flow of a form is explained below using eg: Feedback form.

### [STEP 1](#) Designer Task
* Log in to http://localhost:3000 (forms-flow-web) with valid [user credentials for designer](./forms-flow-idm/keycloak/README.md#formsflow-ai-user-credentials).
* After the log in is successful you will be redirected to http://localhost:3000/form where you can Create / View / Edit / Delete a form.

<!-- ![Image 1](./.images/designer-landing.PNG) -->
![image](https://user-images.githubusercontent.com/70306694/121669233-be026f80-cac9-11eb-89df-2be9f3c5f939.png)

* To create a new form click on **Create Form Button**. You can use the Drag-and-drop forms-builder with rich UI components to create a form with ease.
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

<!-- ![Image 5](./.images/client-landing.PNG) -->
![image](https://user-images.githubusercontent.com/70306694/121672407-6403a900-cacd-11eb-8676-2e986d24dd3e.png)


* Click **Submit New Button** on the form which you wanted to submit.
* The previous action will redirect you to the form, where you can fill the details and Submit.

<!-- ![Image 6](./.images/client-submission.PNG) -->
<!-- ![Image 7](./.images/client-submission-success.PNG) -->
![image](https://user-images.githubusercontent.com/70306694/121672751-c6f54000-cacd-11eb-892f-4677ad0e0bb5.png)

* Fill the details and Submit the form, You can repeat this action as per your requirement.

  ![image](https://user-images.githubusercontent.com/70306694/121672846-e8562c00-cacd-11eb-8ff4-f649b27c44e2.png)
* If you had associated a workflow with the form, the form will start the workflow.
* This action is completed, you can now Log out and go to [STEP 3](#) if you have a user review mentioned in your workflow.
   
### [STEP 3](#) Reviewer Tasks

* Log in to http://localhost:3000 (forms-flow-web) with valid [default user credentials for reviewer](./forms-flow-idm/keycloak/README.md#formsflow-ai-user-credentials).
* After the log in is successful you will be redirected to http://localhost:3000/task.

<!-- ![Image 8](./.images/reviewer-landing.PNG) -->
![image](https://user-images.githubusercontent.com/70306694/121673151-3e2ad400-cace-11eb-9ea7-85f446b664a8.png)

* You can navigate to Applications tab to **View the Form** submissions.
<!-- ![Image 9](./.images/reviewer-view-forms.PNG) -->
<!-- ![Image 10](./.images/reviewer-form-view.PNG) -->
<!-- ![Image 11](./.images/reviewer-print.PNG) -->
![image](https://user-images.githubusercontent.com/70306694/121673324-63b7dd80-cace-11eb-9858-30b5a8042f5f.png)


* You can View the submissions against a form by clicking on **View** button.

![image](https://user-images.githubusercontent.com/70306694/121692462-be106880-cae5-11eb-90a7-abf9a47d5c73.png)


* You can even print the Form submission as a PDF which can be rendered in browser

![image](https://user-images.githubusercontent.com/70306694/121692761-092a7b80-cae6-11eb-8b25-1a8076ef249e.png)


* You can also submit a new form like **Employee Feedback Form** as in [STEP 2](#) from the **Forms** tab.
![image](https://user-images.githubusercontent.com/70306694/121696308-91f6e680-cae9-11eb-897d-ff4ddb93e74f.png)

* Based on the **Employee Feedback** form workflow associated, the form is supposed to be send to a manager with the reviewer role.

![image](https://user-images.githubusercontent.com/70306694/121697036-4a248f00-caea-11eb-96b9-7c64465e3179.png)

* On submitting form, the associated task can be found for the reviewer role in the **Task Menu** section for the Manager
![image](https://user-images.githubusercontent.com/70306694/121697829-1138ea00-caeb-11eb-94f2-28a3425d707f.png)

* On clicking the associated task, the task detailed menu usually has three sections - **Forms**, **History**, **Diagram**
![manager landing](https://user-images.githubusercontent.com/83952803/121698577-c23f8480-caeb-11eb-9f55-16540ae80ecb.PNG)

![manager_diagram](https://user-images.githubusercontent.com/83952803/121698637-cec3dd00-caeb-11eb-8e1f-a6e4c5f717ba.PNG)
![manager_history](https://user-images.githubusercontent.com/83952803/121698653-d5525480-caeb-11eb-9124-fd5a23efdfaa.PNG)

* On claiming the task, the Manager can fill the form and submit his review
* Reviewer action is completed.

## Links

* [Web site](https://formsflow.ai/)
* [Youtube Link](https://youtu.be/_H-P3Av3gqg)

