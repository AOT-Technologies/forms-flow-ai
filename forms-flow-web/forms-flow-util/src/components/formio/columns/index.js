import _ from 'lodash';
import BaseComponent from '../base';
import { toHtml, getDimensions } from './plugins';

class ColumnsComponent extends BaseComponent {
  constructor (component, data, options) {
    super(component, data, options);

    if (this.columns && _.isArray(this.columns)) {
      _.forEach(this.columns, (column) => {
        let components = [];

        _.forEach(column.components, (c) => {
          components.push(this.createComponent(c, data, options));
        });
        column.components = components;
      });
    }
  }

  getDimensions () {
    this._dims = getDimensions(this);
    return this._dims;
  }

  toHtml (element) {
    return toHtml(element, this);
  }
}

export default ColumnsComponent;
