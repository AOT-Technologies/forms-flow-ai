import ContainerComponent from '../container';
import { toHtml, getDimensions } from './plugins';

class FormComponent extends ContainerComponent {
  constructor (component, data, options = {}) {
    super(component, data, options);
  }

  getDimensions () {
    return getDimensions(this);
  }

  toHtml (element) {
    return toHtml(element, this);
  }
}

export default FormComponent;
