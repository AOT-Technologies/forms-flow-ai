import _ from 'lodash';
import BaseComponent from '../base';
import { toHtml } from './plugins';

class WellComponent extends BaseComponent {
  constructor (component, data, options) {
    super(component, data, options);
    if (this.components && _.isArray(this.components)) {
      let components = [];

      _.forEach(this.components, (c) => {
        components.push(this.createComponent(c, data, options));
      });
      this.components = components;
    }
  }

  toHtml (element) {
    return toHtml(element, this);
  }
}

export default WellComponent;
