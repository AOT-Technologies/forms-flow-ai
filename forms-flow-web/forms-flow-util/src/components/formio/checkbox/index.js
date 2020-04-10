import BaseComponent from '../base';

class CheckBoxComponent extends BaseComponent {
  constructor (component, data, options) {
    super(component, data, options);
  }

  formatValue () {
    return this._value ? 'Yes' : 'No';
  }
}

export default CheckBoxComponent;
