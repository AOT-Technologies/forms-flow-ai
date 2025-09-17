## Sequence flows for designer user

Below is the sequence diagram for a designer user when they create and save a form and associate its workflow.

```mermaid
sequenceDiagram
    actor Designer as Designer
    participant web as Web
    participant web-api as Web API
    participant web-api-db as Web API Database
    participant forms-api as Forms API
    participant forms-db as Forms Database

    Designer ->> web: Create Form
    activate web
    web ->> web-api: Save form design
    Note over web,web-api: "POST /form/form-design"
    activate web-api
    web-api ->> forms-api: Save form data to form.io
    Note over web-api,forms-api: "POST /form"
    activate forms-api
    forms-api->>forms-db: Save form data
    forms-db-->>forms-api: 
    forms-api -->> web-api: Form created
    deactivate forms-api
    web-api ->> web-api-db: Create records in form process mapper
    web-api-db -->> web-api:
    web-api ->> web-api-db: Create audit records
    web-api-db -->> web-api:
    web-api ->> web-api-db: Create authorization records
    web-api-db -->> web-api:
    web-api ->> web-api-db: Create default workflow in process table
    web-api-db -->> web-api : 
    web-api -->> web : 
    deactivate web-api
    deactivate web

    Designer ->> web: Update Form
    activate web
    web ->> web-api: Update form design
    Note over web,web-api: "PUT /form/form-design/:form-id"
    activate web-api
    web-api ->> forms-api: Update form data to form.io
    Note over web-api,forms-api: "PUT /form/:form-id"
    activate forms-api
    forms-api->>forms-db: Update form data
    forms-db-->>forms-api: 
    forms-api -->> web-api: Form updated
    deactivate forms-api
    web-api ->> web-api-db: Create audit records
    web-api-db -->> web-api:
    web-api -->> web : 
    deactivate web-api
    deactivate web

    Designer ->> web: Update Workflow
    activate web
    web ->> web-api: Update process
    Note over web,web-api: "PUT /process/:process-id"
    activate web-api
    web-api ->> web-api-db: Update process
    web-api-db -->> web-api:
    web-api -->> web:
    deactivate web-api 
    deactivate web

    Designer ->> web: Update form settings
    activate web
    web ->> web-api: Update form mapper
    Note over web,web-api: "PUT /form/:form-mapper-id"
    activate web-api
    web-api ->> web-api-db: Update form mapper
    web-api-db -->> web-api:
    web-api -->> web:
    deactivate web-api 
    deactivate web

    Designer ->> web: Publish Form
    activate web
    web ->> web-api: Publish Form
    Note over web,web-api: "POST /form/:form-mapper-id/publish"
    activate web-api
    web-api->>bpm-api: Deploy workflow
    activate bpm-api
    Note over web-api,bpm-api: "POST /deployment/create"
    bpm-api ->> bpm-db: Deploy workflow
    bpm-db -->> bpm-api: 
    bpm-api -->> web-api: Workflow deployed
    deactivate bpm-api
    web-api ->> web-api-db: Create audit records for form and process
    web-api-db -->> web-api:
    web-api ->> web-api-db: Update form mapper status
    web-api-db -->> web-api:
    web-api -->> web:
    deactivate web-api
    deactivate web  



```