 /* istanbul ignore file */
import FormioExport from 'aot-formio-export';
import moment from "moment";

const getPdf = (formResponse, submissionData, callback) => {
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
        filename: `${component.title}-${Date.now()}.pdf`, // the pdf file name
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

const PdfDownloadService ={
  getPdf
};

export default PdfDownloadService;

