import _ from 'lodash';
import FormioExportUtils from '../../../utils';
import FormioComponent from '../';
import { toHtml, getDimensions } from './plugins';

class BaseComponent {

  constructor (component, data, options = {}) {
    if (!(this instanceof BaseComponent)) {
      return new BaseComponent(component, data);
    }

    this.type = '';
    this._options = _.cloneDeep(options);
    this._value = null;
    this._dims = {};
    this._baseWidth = 1;
    this._baseHeight = 1;

    if (_.isObject(component) && component.hasOwnProperty('type')) {
      let comp = _.cloneDeep(component);

      for (let property in comp) {
        this[property] = comp[property];
      }
    }

    if (data === null) {
      return this;
    }

    if (_.isPlainObject(data)) {
      this._value = FormioExportUtils.getValue({ data: data }, this.key);
      if (_.isNil(this._value) && !this.input) {
        this._value = _.cloneDeep(data);
      }
    } else {
      this._value = data;
    }
  }

  getLabel () {
    return this.legend || this.title || this.label || this.key;
  }

  getHtml () {
    return this.html;
  }
  emptyValue () {
    return _.isNil(this._options.emptyValue) ? '' : this._options.emptyValue;
  }

  toHtml (element) {
    return toHtml(element, this);
  }

  getDimensions () {
    this._dims = getDimensions(this);
    return this._dims;
  }

  hasComponents () {
    const hasColumns = this.columns && Array.isArray(this.columns);
    const hasRows = this.rows && Array.isArray(this.rows);
    const hasComps = this.components && Array.isArray(this.components);

    return hasColumns || hasRows || hasComps;
  }

  updateDimensions () {
    this._width = 1;
    this._height = 1;
  }

  createComponent (component, data, options) {
    return FormioComponent.create(component, data, options);
  }

  formatValue () {
    if (_.isNil(this._value)) {
      return this.emptyValue();
    }
    return this._value.toString();
  }

  isLayoutComponent () {
    return false;
  }
}

export default BaseComponent;
