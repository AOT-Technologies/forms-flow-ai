import _ from 'lodash';
import FormioExportUtils from '../../../../utils';

export default (element, component) => {
  if (component && component.tableView) {
    let componentElement = FormioExportUtils.createElement('div', {
      class: `formio-component ${component.type}-component `,
      id: Math.random().toString(36).substring(7)
    });

    let htmlElement = FormioExportUtils.createElement('div', {
      class: 'html'
    });

    htmlElement.insertAdjacentHTML('beforeend', component.getHtml());

    componentElement.appendChild(htmlElement);

    if (_.isElement(element)) {
      element.appendChild(componentElement);
    }
    return componentElement;
  }
  return null;
};
