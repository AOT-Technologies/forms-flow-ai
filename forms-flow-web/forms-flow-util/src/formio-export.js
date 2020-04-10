import _ from 'lodash';
import FormioExportUtils from './utils';
import FormioComponent from './components/formio';

// Import export plugins
import {
  toHtml,
  toPdf,
  toXlsx
} from './plugins';

/**
 * Class for exporting formio components into different formats
 *
 * @class FormioExport
 */
class FormioExport {

  /**
   * Creates an instance of FormioExport.
   * @param {any} component The formio component
   * @param {any} data The formio component data
   * @param {any} [options={}] Formio optional parameters
   * @memberof FormioExport
   */
  constructor (component, data, options = {}) {

    if (!(this instanceof FormioExport)) {
      return new FormioExport(component, data);
    }

    this.component = null;
    this.data = {};
    this.options = {};

    if (options.hasOwnProperty('formio')) {
      this.options = _.cloneDeep(options.formio);
    }

    if (options.hasOwnProperty('component')) {
      this.component = options.component;
    } else if (component) {
      this.component = component;
    }

    if (options.hasOwnProperty('data')) {
      this.data = options.data;
    } else if (!_.isNil(data)) {
      this.data = data;
    }

    if (FormioExportUtils.isFormioSubmission(this.data)) {
      this.data = this.data.data;
    }

    if (options.hasOwnProperty('meta')) {
      this.options.submission = this.options.submission || {};
      this.options.submission.generatedOn = options.meta.generatedOn;
      this.options.submission.generatedBy = options.meta.generatedBy;
    }

    if (this.component) {
      if (FormioExportUtils.isFormioForm(this.component) || FormioExportUtils.isFormioWizard(this.component)) {
        this.component.type = 'form';
        this.component.display = 'form';
      }
      this.component = FormioComponent.create(component || this.component, this.data, this.options);
    } else if (!this.component) {
      console.warn(this.constructor.name, 'no component defined');
    }

  }

  /**
   * Renders the formio component to HTML
   *
   * @returns {Promise} The promise containing the HTML render of the formio component
   * @memberof FormioExport
   */
  toHtml () {
    return new Promise((resolve, reject) => {
      try {
        toHtml(this.component).then((html) => resolve(html));
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Exports the formio component to a jsPDF object
   *
   * @param {any} [config={}] The Html2PDf configuration
   * @returns {Promise} The promise containing the jsPDF object
   * @memberof FormioExport
   */
  toPdf (config = {}) {
    return new Promise((resolve, reject) => {
      try {
        this.toHtml().then((source) => {
          toPdf(Object.assign(config, { source: source })).then((pdf) => resolve(pdf));
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Exports the formio component to a xlsx object
   *
   * @param {any} [config={}] The xlsx configuration
   * @returns {Promise} The promise containing the xlsx object
   * @memberof FormioExport
   */
  toXlsx (config = {}) {
    return new Promise((resolve, reject) => {
      try {
        toXlsx(config).then((xlsx) => resolve(xlsx));
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Renders the formio component to HTML
   *
   * @param {any} options The FormioExport options
   * @returns {Promise} The promise containing the HTML render of the formio component
   * @memberof FormioExport
   */
  static toHtml (options) {
    return new Promise((resolve, reject) => {
      try {
        options = FormioExportUtils.verifyProperties(options, {
          component: {
            type: Object,
            required: true
          },
          formio: {
            type: Object
          }
        });
        (new FormioExport(options.component, options.data, options.formio)).toHtml().then((html) => {
          resolve(html);
        });
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  }

  /**
   * Exports the formio component to a jsPDF object
   *
   * @param {any} options The FormioExport configuration
   * @returns {Promise} The promise containing the jsPDF object
   * @memberof FormioExport
   */
  static toPdf (options) {
    return new Promise((resolve, reject) => {
      try {
        options = FormioExportUtils.verifyProperties(options, {
          component: {
            type: Object,
            required: true
          },
          formio: {
            type: Object
          },
          config: {
            type: Object,
            default: {
              filename: `export-${Math.random().toString(36).substring(7)}.pdf`
            }
          }
        });
        (new FormioExport(options.component, options.data, options.formio)).toPdf(options.config).then((pdf) => {
          resolve(pdf);
        });

      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  }

  /**
   * Exports the formio component to a xlsx object
   *
   * @param {any} options The FormioExport configuration
   * @returns {Promise} The promise containing the xlsx object
   * @memberof FormioExport
   */
  static toXlsx (options) {
    return new Promise((resolve, reject) => {
      try {
        options = FormioExportUtils.verifyProperties(options, {
          component: {
            type: Object,
            required: true
          },
          formio: {
            type: Object
          },
          config: {
            type: Object
          }
        });
        (new FormioExport(options.component, options.data, options.formio)).toXlsx(options.config).then((xlsx) => {
          resolve(xlsx);
        });
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  }
};

export default FormioExport;
