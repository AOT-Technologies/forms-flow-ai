import ContainerComponent from '../container';
import { toHtml } from './plugins';

class ContentComponent extends ContainerComponent {
  constructor (component, data, options) {
    super(component, data, options);
  }

  toHtml (element) {
    return toHtml(element, this);
  }

}

export default ContentComponent;
