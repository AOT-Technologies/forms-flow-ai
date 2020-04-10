import _ from 'lodash';
import BaseComponent from '../base';

class NumberComponent extends BaseComponent {
  constructor (component, data, options) {
    super(component, data, options);
  }

  formatValue () {
    if (_.isNil(this._value)) {
      return this.emptyValue();
    }
    return this._value.toLocaleString();
  }
}

export default NumberComponent;
