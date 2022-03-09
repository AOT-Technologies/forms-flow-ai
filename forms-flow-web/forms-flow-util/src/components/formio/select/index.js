import _ from 'lodash';
import FormioExportUtils from '../../../utils';
import BaseComponent from '../base';
import { toHtml } from './plugins';

class SelectComponent extends BaseComponent {
  constructor (component, data, options) {
    super(component, data, options);

    if (!this.multiple) {
      this._value = [this._value];
    }
  }

  toHtml (element) {
    return toHtml(element, this);
  }

  formatValues () {
    if (_.isNil(this._value)) {
      return this.emptyValue();
    }
    let values = [];

    _.forEach(this._value, (value) => {
      values.push(this.formatValue(value));
    });
    return values;
  }

  formatValue (value) {
    if (_.isNil(value)) {
      return this.emptyValue();
    }
    switch (this.dataSrc) {
      case 'url':
        return value;
      case 'custom':
      case 'resource':
        return _.isPlainObject(value) ? FormioExportUtils.interpolate(this.template, { item: value }) : value;
      case 'values':
      case 'json':
        let valueProperty = this.valueProperty || 'value';
        let item = _.find(this.data[this.dataSrc], (o) => {
          if (typeof value === 'object') {
            return _.isEqual(value, o);
          }
          return o[valueProperty] === value;
        });

        return _.isPlainObject(item) ? FormioExportUtils.interpolate(this.template, { item: item }) : value;
      default:
        return value;
    }
  }
}

export default SelectComponent;
