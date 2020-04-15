import _ from 'lodash';
import BaseComponent from '../base';

class TextFieldComponent extends BaseComponent {
  constructor (component, data, options) {
    super(component, data, options);
  }
  formatValue () {
    if (_.isEmpty(this._value)) {
      return this.emptyValue();
    }
    let value = typeof this._value === 'string' ? this._value : this._value.toString();

    if (this.type === 'textarea' && this.editor === 'ckeditor') {
      value = value.replace(/<\/?[^>]+(>|$)/g, '').replace(/&nbsp;/g, ' ');
    }
    return value;
  }
}

export default TextFieldComponent;
