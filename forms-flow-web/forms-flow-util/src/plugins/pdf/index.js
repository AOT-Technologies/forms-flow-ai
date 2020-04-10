import Html2Pdf from 'js-html2pdf';
import FormioExportUtils from '../../utils';

export default (config = {}) => {
  return new Promise((resolve, reject) => {
    try {
      config = FormioExportUtils.verifyProperties(config, {
        source: {
          type: Element,
          required: true
        },
        download: {
          type: Boolean,
          default: false
        }
      });
      Html2Pdf.getPdf(config).then((pdf) => resolve(pdf));
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};
