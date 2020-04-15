 

> formUrl = http://localhost:3001/#/form/5bf494515dd4890698a96bc6/ (or json representation)  

> submissionData = http://localhost:3001/#/form/5bf494515dd4890698a96bc6/submission/5bf495b05dd4890698a96bca (or json representation)
```js
toPdf: function(formUrl, submissionData, callback) {
    $.get(formUrl, function(formResponse) {

        var component = formResponse;

        var hasSubmission = submissionData !== null;
        var submission = hasSubmission ? submissionData : null;
        var emptyValue = hasSubmission ? 'n/a' : '';

        var willDownload = callback === null || callback === undefined;

        var options = {
            formio: { // component specific configuration
                ignoreLayout: true, // should html render respect formio layouts (columns, lables positions, etc)
                emptyValue: emptyValue // default empty value for rendered components
            },
            component: component,
            data: submission,
            config: { // pdf export configuration
                download: willDownload, // should the pdf file be downloaded once rendered
                filename: 'download.pdf', // the pdf file name
                margin: 10, // the pdf file margins
                html2canvas: {
                    scale: 5, // scale factor for rendering the canvas (overall resolution of the canvas image)
                    logging: false // should console logging be enable during rendering
                },
                jsPDF: {
                    orientation: 'p', // PDF orientation - potrait / landscape
                    unit: 'mm', // measurement units used
                    format: 'letter' // paper size - can also accept custom (i.e. A4 - [210, 297])
                }
            },
            meta: {
                generatedOn: moment().format('lll'),
                generatedBy: emailAddress
            }
        }

        var exporter = new FormioExport(component, submission, options);

        if (willDownload) {
            exporter.toPdf(options.config);
        } else if (callback) {
            exporter.toPdf(options.config).then(callback);
        }
    });
}
```		

# Formio Export Tools

![GitHub package version](https://img.shields.io/github/package-json/v/airarrazaval/formio-export.svg) 
![npm (tag)](https://img.shields.io/npm/v/formio-export/latest.svg)


This library is a plain JavaScript export tool for Form.io componets.  This allows to export any Form.io component (with or without submission data) to PDF (other formats comming soon).

* [Live Demo - Source](https://stackblitz.com/edit/formio-export)
* [Live Demo - Package](https://stackblitz.com/edit/formio-export-npm)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Installing

To install this package into your project, you can use the following command within your terminal

```
npm install --save formio-export
```

# Usage

Creating a FormioExport instance

```javascript
import FormioExport from 'formio-export';

let exporter = new FormioExport(component, data, options);
```

Using static methods
```javascript
let options = {
  component: component,
  data: data,
  formio: {
    // component specific configuration
  },
  config: {
    // pdf export configuration
  }
};

FormioExport.toPdf(options).then((pdf) => {
  // do something
})
```
# Configuration

The FormioExport instance can be initialized using the following configuration:

```javascript
let options = {
  component: component    // the formio component
  data: data              // the formio component's data or submission
  formio: {
    ignoreLayout: true,   // should html render respect formio layouts (columns, lables positions, etc)
    emptyValue: 'n/a'     // default empty value for rendered components
  }
}
```

The PDF export is also configurable using the following parameters:

```javascript
let config: {
  download: false,      // should the pdf file be downloaded once rendered
  filename: 'file.pdf', // the pdf file name
  margin: 10,           // the pdf file margins
  html2canvas: {
    scale: 2,           // scale factor for rendering the canvas (overall resolution of the canvas image)
    logging: false      // should console logging be enable during rendering
  },
  jsPDF: {
    orientation: 'p',   // PDF orientation - potrait / landscape
    unit: 'mm',         // measurement units used
    format: 'a4'        // paper size - can also accept custom (i.e. A4 - [210, 297])
  }
}
```

To get more information on PDF file configuration please read the following documentation:

* [html2canvas](http://html2canvas.hertzen.com/configuration) - JavaScript html to canvas renderer library
* [jsPDF](https://rawgit.com/MrRio/jsPDF/master/docs/jsPDF.html) - Client-sdie JavaScript PDF generator library

# Simple Example

Using the FormioExport instance:

```javascript
import FormioExport from 'formio-export';

let component = {
  type: 'form',
  title: 'Example',
  display: 'form',
  components: [
    {
      type: 'textfield',
      key: 'name',
      label: 'Name',
      input: true
    },
    {
      type: 'number',
      key: 'age',
      label: 'Age',
      input: true
    }
  ]
};

let submission = {
  _id: '<submission id>',
  owner: '<owner id>',
  modified: '1970-01-01T00:00:00.000Z',
  data: {
    name: 'John Doe',
    age: 25
  }
};

let options = {
  ignoreLayout: true
}

let exporter = new FormioExport(component, submission, options);

exporter.toHtml().then((html) => {
  document.body.appendChild(html);
});

let config = {
  download: false,
  filename: 'example.pdf'
};

exporter.toPdf(config).then((pdf) => {
  // download the pdf file
  pdf.save();
  // get the datauri string
  let datauri = pdf.output('datauristring');
})
```

Using the FormioExport static methods

```javascript
let config = {
  component: component,
  data: submission,
  config
}
```

# Building

Clone git repository:

```
git clone git@github.com:airarrazaval/formio-export.git
```

Install dependencies:

```
npm install
```

Build browser bundle

```
npm run build
```

## Running the tests

Tests use samples provided in `test/samples` and should use [Form.io's Component JSON Schema](https://github.com/formio/formio.js/wiki/Components-JSON-Schema) structure.

```
npm run test
```
## NPM Packaging
### Creating a public package and publish in https://npm.pkg.github.com/

* Through Github, create personal access token with publish rights (https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line), keep a copy of it or you have to regenerate again
* Login using the token (Note: username: $userid not email id [guru-aot], password: personal access token got from previous steps, Email: AOT email id)
```
npm login --registry=https://npm.pkg.github.com/
```
* First time, you have will get an Email, please verify it or while publishing it will ask you to verify.
* Rename the existing package.json to something and rename the publicPackagePublishJson.md to package.json
* Increase the version accordingly in the package.json
* Run the below command to publish
```
npm publish
```
* You can manually log into https://go.npm.me/login to check your published packages.

### Creating a private package

* Rename existing backup.npmrc to .npmrc, run
```
ls -a
```
to view hidden files in shell
* Upgrade the version in package.json file
* Upgrade user to publish private packages, in https://www.npmjs.com and try
```
npm publish
```
* You can see the published packages in the corresponding github repositories

## Built With

* [js-html2pdf](https://github.com/airarrazaval/html2pdf) - Html to Pdf javascript library
* [html2canvas](http://html2canvas.hertzen.com) - JavaScript html to canvas renderer library
* [jsPDF](https://github.com/MrRio/jsPDF) - Client-sdie JavaScript PDF generator library

