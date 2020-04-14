import _ from 'lodash';
import BaseComponent from '../base';
import { toHtml } from './plugins';

class SurveyComponent extends BaseComponent {
  constructor (component, data, options) {
    super(component, data, options);
  }

  toHtml (element) {
    return toHtml(element, this);
  }

  formatValue (option, question) {
    if (_.isNil(option) || _.isNil(question)) {
      return this.emptyValue();
    }
    let value = {};

    _.forEach(this.questions, (item) => {
      if (item.value === question) {
        value.question = item.label;
      }
    });
    _.forEach(this.values, (item) => {
      if (item.value === option) {
        value.option = item.label;
      }
    });
    return value;
  }

  formatValues () {
    if (_.isNil(this._value)) {
      return this.emptyValue();
    }
    let values = [];

    _.forEach(this._value, (option, question) => {
      values.push(this.formatValue(option, question));
    });
    return values;
  }
}

export default SurveyComponent;
