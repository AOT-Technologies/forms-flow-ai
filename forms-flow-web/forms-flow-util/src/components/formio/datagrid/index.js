import _ from 'lodash';
import BaseComponent from '../base';
import { toHtml, getDimensions } from './plugins';

class DataGridComponent extends BaseComponent {
  constructor (component, data, options) {
    super(component, data, options);

    this.numCols = Array.isArray(this.components) ? this.components.length : 0;
    this.numRows = Array.isArray(this._value) ? this._value.length : 0;
    this.rows = [];

    if (_.isArray(this._value)) {
      _.forEach(this._value, (value) => {
        let row = [];

        _.forEach(this.components, (c) => {
          row.push(this.createComponent(c, value[c.key], options));
        });
        this.rows.push(row);
      });
    }
  }

  getDimensions () {
    return getDimensions(this);
  }

  toHtml (element) {
    return toHtml(element, this);
  }
}

export default DataGridComponent;
