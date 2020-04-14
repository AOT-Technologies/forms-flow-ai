import _ from 'lodash';
import BaseComponent from '../base';

class AddressComponent extends BaseComponent {
  constructor (component, data, options) {
    super(component, data, options);
  }

  formatValue () {
    if (_.isNil(this._value)) {
      return this.emptyValue();
    }
    return _.isObject(this._value) ? this._value.formatted_address : this._value;
  }
}

export default AddressComponent;
