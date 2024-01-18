# formsflow.ai Documents API

![Python](https://img.shields.io/badge/python-3.9-blue) ![Flask](https://img.shields.io/badge/Flask-2.3.3-blue) ![postgres](https://img.shields.io/badge/postgres-11.0-blue)
[![Imports: isort](https://img.shields.io/badge/%20imports-isort-%231674b1?style=flat&labelColor=ef8336)](https://pycqa.github.io/isort/) [![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![linting: pylint](https://img.shields.io/badge/linting-pylint-yellowgreen)](https://github.com/PyCQA/pylint)


The goal of the document API is to generate pdf with form submission data. It is built using Python :snake: .

## Table of Content

- [formsflow.ai Documents API](#formsflowai-documents-api)
  - [Table of Content](#table-of-content)
  - [Usage guidlines](#usage-guidlines)
    - [Generate default PDF](#generate-default-pdf)
    - [Generate PDFs with generic custom theme](#generate-pdfs-with-generic-custom-theme)
    - [Generate PDFs with dedicated custom theme](#generate-pdfs-with-dedicated-custom-theme)
  - [Prerequisites](#prerequisites)
  - [Solution Setup](#solution-setup)
    - [Installation](#installation)
    - [Keycloak Setup](#keycloak-setup)
    - [Environment Configuration](#environment-configuration)
    - [Running the Application](#running-the-application)
      - [To Stop the Application](#to-stop-the-application)
    - [Verify the Application Status](#verify-the-application-status)

## Usage guidlines

The document API provides a POST endpoint which supports custom themed templates for the PDF.

`{FORMSFLOW_DOC_API_URL}/form/{formId}/submission/{submissionId}/export/pdf`

### Generate default PDF 

The document API will use the default theme when no template is passed. The default theme 
will be similar to the theme used in the application UI.

example request body
```
{}
```

### Generate PDFs with generic custom theme

The document API accept `template` attribute from the request body.
The expected value for the template attribute is a base64 encoded [jinja](https://jinja.palletsprojects.com/en/3.1.x/) template.
When using a generic custom theme the body should not contain any other attributes like `templateVars` which will force 
the API to operate on  [dedicated custom theme mode](#generate-pdfs-with-dedicated-custom-theme)

For flexibility when using this mode, the template designer can expect `form` object which contains both form and submission data.
TODO: More details on form object

When designing a custom jinja template the following code blocks are required
```
{% extends "template.html" %} <!-- Required -->
{% block links %} <!-- Required -->
   <!-- 
   This block will be placed as the child of <head> tag in the base template
   This block is ideal for <style> and <link> tags
    -->
{% endblock %} <!-- Required -->
{% block content %} <!-- Required -->
  <!-- 
   This block will be placed as the child of <body> tag in the base template
   This block is ideal for the actual content.
   All valid html tags that we typically use under <body> tag can be used here.
   Additionally {{form}} object will contain all the data related to form and submission will be
   available.
    -->
{% endblock %} <!-- Required -->

```

example

```
{% extends "template.html" %}
{% block links %}
  <style type="text/css">
    .container{
        margin-top: 10px;
    }
    .head{
        text-align: center;
        margin-bottom: 10px;
    }
    table {
    font-family: arial, sans-serif;
    border-collapse: collapse;
    width: 100%;
    }

    td, th {
    border: 1px solid #dddddd;
    text-align: left;
    padding: 15px;
    }
  </style>
{% endblock %}
{% block content %}
  <div class="container">
    <div class="head">
        <h1>{{form.form.title}}</h1>
    </div>
    <table>
      {% for item in form['data'] %}
      <TR>
         <TD>{{form['data'][item]['label']}}</TD>
         {% if is_signature(form['data'][item]['value']) %}
         <TD><img src="{{form['data'][item]['value']}}" /></TD>
         {% else %}
         <TD>{{form['data'][item]['value']}}</TD>
         {% endif %}
      </TR>
      {% endfor %}
      </table>
  </div>
{% endblock %}
```

The example template will produce a PDF in a tabular form

[Preview](https://github.com/sreehari-aot/forms-flow-ai/blob/pdf-template/.images/export_pdf_template_1.pdf)


TODO: Provide details for `form` object 

TODO: Add usecases 


### Generate PDFs with dedicated custom theme

The document API supports `templateVars` attribute in request body which should contain
all the key value pairs of dynamic content that should be used for PDF generation.

Make sure the given `template` accept the given keys too.

`templateVars` should be JSON friendly data.

example 
```
"templateVars": {"invoiceNumber": 7723949372643552}

```

`template` should be base64 encoded form of the actual template.

When using this mode the `template` doesn't have to follow any specific rules, except the 
template should be valid jinja template.


## Prerequisites

* For docker based installation [Docker](https://docker.com) need to be installed.
* Admin access to [Keycloak](../forms-flow-idm/keycloak) server and ensure audience(camunda-rest-api) is setup in Keycloak-bpm server.

## Solution Setup

### Installation

If you are interested in contributing to the project, you can install through docker or locally.

It's recommended to download dev-packages to follow Python coding standards for project like PEP8 if you are interested in contributing to project.
You installing dev-packages using pip as follows:

```python3 -m pip install -r requirements/dev.txt```

### Keycloak Setup

No specific client creation is required. Audience has been added for clients
**forms-flow-web** and **forms-flow-bpm**.  

### Environment Configuration

* Make sure you have a Docker machine up and running.
* Make sure your current working directory is "forms-flow-ai/forms-flow-documents".
* Rename the file [sample.env](./sample.env) to **.env**.
* Modify the environment variables in the newly created **.env** file if needed. Environment variables are given in the table below,
* **NOTE : {your-ip-address} given inside the .env file should be changed to your host system IP address. Please take special care to identify the correct IP address if your system has multiple network cards**

> :information_source: Variables with trailing :triangular_flag_on_post: in below table should be updated in the .env file

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`FORMSFLOW_API_DB_USER`|formsflow database postgres user|Used on installation to create the database.Choose your own|`postgres`
`FORMSFLOW_API_DB_PASSWORD`|formsflow database postgres password|Used on installation to create the database.Choose your own|`changeme`
`FORMSFLOW_API_DB_NAME`|formsflow database name|Used on installation to create the database.Choose your own|`FORMSFLOW_API_DB`
`FORMSFLOW_API_DB_URL`|JDBC DB Connection URL for formsflow||`postgresql://postgres:changeme@forms-flow-webapi-db:5432/webapi`
`KEYCLOAK_URL`:triangular_flag_on_post:| URL to your Keycloak server || `http://{your-ip-address}:8080`
`KEYCLOAK_URL_REALM`|The Keycloak realm to use|eg. forms-flow-ai | `forms-flow-ai`
`KEYCLOAK_BPM_CLIENT_ID`|Client ID for Camunda to register with Keycloak|eg. forms-flow-bpm|`forms-flow-bpm`
`KEYCLOAK_BPM_CLIENT_SECRET`|Client Secret of Camunda client in realm|eg. 22ce6557-6b86-4cf4-ac3b-42338c7b1ac12|`e4bdbd25-1467-4f7f-b993-bc4b1944c943` <br><br>`To generate a new keycloak client seceret by yourself follow the steps from` [here](../forms-flow-idm/keycloak/README.md#getting-the-client-secret)
`KEYCLOAK_WEB_CLIENT_ID`|Client ID for formsflow to register with Keycloak|eg. forms-flow-web|`forms-flow-web`
`CAMUNDA_API_URL`:triangular_flag_on_post:|Camunda Rest API URL||`http://{your-ip-address}:8000/camunda`
`FORMSFLOW_API_URL`:triangular_flag_on_post:|formsflow.ai Rest API URL||`http://{your-ip-address}:5000`
`FORMSFLOW_DOC_API_URL`:triangular_flag_on_post:|formsflow.ai Document service URL||`http://{your-ip-address}:5006`
`FORMSFLOW_API_CORS_ORIGINS`| formsflow.ai Rest API allowed origins, for allowing multiple origins you can separate host address using a comma seperated string or use * to allow all origins |eg:`host1, host2, host3`| `*`

**NOTE : Default realm is `forms-flow-ai`**

### Running the Application

* forms-flow-api service uses port 5006, make sure the port is available.
* `cd {Your Directory}/forms-flow-ai/forms-flow-documents`

* Run `docker-compose up -d` to start.

*NOTE: Use --build command with the start command to reflect any future **.env** changes eg : `docker-compose up --build -d`*

#### To Stop the Application

* Run `docker-compose stop` to stop.

### Verify the Application Status

   The application should be up and available for use at port defaulted to 5006 in <http://localhost:5006/>
  
* Access the **/checkpoint** endpoint for a Health Check on API to see it's up and running.

```
GET http://localhost:5006/checkpoint

RESPONSE

{
    "message": "Welcome to formsflow.ai documents API"
}
```
