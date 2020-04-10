import _ from 'lodash';
import FormioExportUtils from '../../../../utils';

export default (element, component) => {
  if (component && component.columns) {

    let componentElement = FormioExportUtils.createElement('div', {
      class: `formio-component ${component.type}-component`,
      id: Math.random().toString(36).substring(7)
    });

    componentElement.className += component._options.ignoreLayout ? ' no-layout' : '';

    _.forEach(component.columns, (column) => {
      let className = `col col-sm-${column.width}`;

      if (column.offset) {
        className += ` col-sm-offset-${column.offset}`;
      }

      if (column.push) {
        className += ` col-sm-push-${column.push}`;
      }

      if (column.pull) {
        className += ` col-sm-pull-${column.pull}`;
      }

      let columnComponent = FormioExportUtils.createElement('div', { class: className });

      _.forEach(column.components, (comp) => {
        comp.toHtml(component._ignoreLayout ? componentElement : columnComponent);
      });
      if (!component._ignoreLayout) {
        componentElement.appendChild(columnComponent);
      }
    });

    if (_.isElement(element)) {
      element.appendChild(componentElement);
    }
    return componentElement;
  }
  return null;
};
