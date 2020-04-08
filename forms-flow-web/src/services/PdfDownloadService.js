import FormioExport from 'aot-formio-export';
/*import UserService from "./UserService";*/
import moment from "moment";

const getPdf = (formResponse, submissionData, callback) => {
  console.log(FormioExport);
    let component = formResponse;

    let hasSubmission = submissionData !== null;
    let submission = hasSubmission ? submissionData : null;
    let emptyValue = hasSubmission ? '-' : '';

    let willDownload = callback === null || callback === undefined;

    let options = {
      formio: { // component specific configuration
        ignoreLayout: true, // should html render respect formio layouts (columns, lables positions, etc)
        emptyValue: emptyValue // default empty value for rendered components
      },
      component: component,
      data: submission,
      config: { // pdf export configuration
        download: willDownload, // should the pdf file be downloaded once rendered
        filename: `${component.title}-download.pdf`, // the pdf file name
        margin: 10, // the pdf file margins
        html2canvas: {
          scale: 5, // scale factor for rendering the canvas (overall resolution of the canvas image)
          logging: false // should console logging be enable during rendering
        },
        jsPDF: {
          orientation: 'p', // PDF orientation - potrait / landscape
          unit: 'mm', // measurement units used
          format: 'letter' // paper size - can also accept custom (i.e. A4 - [210, 297])
        },
      },

   meta: {
        generatedOn: moment(submissionData.modified).format("DD-MM-YYYY hh:mm:ss"),
        generatedBy: submissionData.owner

      }

    };

    const exporter = new FormioExport(component, submission, options);

    if (willDownload) {
      exporter.toPdf(options.config);
    } else if (callback) {
      exporter.toPdf(options.config).then(callback);
    }
}
/*function pdfCallback(pdfObject) {
  var number_of_pages = pdfObject.internal.getNumberOfPages()
  var pdf_pages = pdfObject.internal.pages
  var myFooter = "Footer info"
  for (var i = 1; i < pdf_pages.length; i++) {
      // We are telling our pdfObject that we are now working on this page
      pdfObject.setPage(i)
      // The 10,200 value is only for A4 landscape. You need to define your own for other page sizes
      pdfObject.text(myFooter, 10, 200)
  }
}*/
export default {
  getPdf
}
