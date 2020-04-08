import _ from 'lodash';

const FormioExportUtils = {

  /**
   * Verifies an object properties.
   *
   * @param {Object} obj
   *   The object to verify
   * @param {Object} props
   *   The properties to be verified
   * @returns {Object}
   *   The verified object
   */
  verifyProperties (obj, props) {
    // verify arguments
    props = _.isPlainObject(props) ? props : {};
    obj = _.isPlainObject(obj) ? obj : {};

    // verify each property
    _.forEach(props, (prop, key) => {
      // check if there is any default value defined
      if (prop.hasOwnProperty('default') && !obj.hasOwnProperty(key)) {
        // set default property value
        obj[key] = prop.default;
      }
      // check if the property is required and defined
      if (prop.required && _.isNil(obj[key])) {
        // if not defined, throw error
        throw new Error(`[FormioExportUtils] invalid property (${key} is required)`);
      }
      // check that the property type is valid (defined by constructors)
      if (prop.hasOwnProperty('type') && obj.hasOwnProperty(key)) {
        // check if property has a valid type
        let found = !!_.find(_.isArray(prop.type) ? prop.type : [prop.type], (type) => {
          return FormioExportUtils.isOfType(obj[key], type);
        });

        // check if there has been a match
        if (!found) {
          // if no match found, throw error
          throw new Error(`[FormioExportUtils] invalid property (${key} type is invalid)`);
        }
      }
    });
    // return the verified object
    return obj;
  },

  /**
   * Check if an object is of a certain type
   *
   * @param {any} obj
   *   The object to check
   * @param {Function} type
   *   The type (constructor) to compare to
   * @returns {Boolean}
   *   Is of same type
   */
  isOfType (obj, type) {
    switch (type) {
      case null:
        return _.isNull(obj);
      case undefined:
        return _.isUndefined(obj);
      case String:
        return _.isString(obj);
      case Number:
        return _.isNumber(obj);
      case Boolean:
        return _.isBoolean(obj);
      case Array:
        return _.isArray(obj);
      case Object:
        return _.isPlainObject(obj);
      case Element:
        return _.isElement(obj) || (_.isObject(obj) && obj.nodeType > 0);
      case Function:
        return _.isFunction(obj);
      case Date:
        return _.isDate(obj);
      case RegExp:
        return _.isRegExp(obj);
      case Error:
        return _.isError(obj);
      case Symbol:
        return _.isSymbol(obj);
      default:
        console.warn('[FormioExportUtils] type not implemented');
        return false;

    }
  },

  /**
   * Check if an object is a valid Formio form
   *
   * @param {Object} [obj={}]
   *   The object to check
   * @returns {Boolean}
   *   Is valid Formio form
   */
  isFormioForm (obj = {}) {
    return _.isPlainObject(obj) && _.isArray(obj.components) && obj.display === 'form';
  },

  /**
   * Check if an object is a valid Formio wizard
   *
   * @param {Object} [obj={}]
   *   The object to check
   * @returns {Boolean}
   *   Is valid Formio wizard
   */
  isFormioWizard (obj = {}) {
    return _.isPlainObject(obj) && _.isArray(obj.components) && obj.display === 'wizard';
  },

  /**
   * Check if an object is a valid Formio submission
   *
   * @param {Object} [obj={}]
   *   The object to check
   * @returns {Boolean}
   *   Is valid Formio submission
   */
  isFormioSubmission (obj = {}) {
    return _.isPlainObject(obj) && _.isPlainObject(obj.data) && obj.hasOwnProperty('_id');
  },

  /**
   * Get the value for a component key, in the given submission.
   *
   * @param {Object} data
   *   A submission or data object to search.
   * @param {String} key
   *   A for components API key to search for.
   */
  getValue (data, key) {
    const search = (obj) => {
      if (_.isPlainObject(obj)) {
        if (_.has(obj, key)) {
          return obj[key];
        }

        let value = null;

        _.forOwn(obj, (prop) => {
          const result = search(prop);

          if (!_.isNil(result)) {
            value = result;
            return false;
          }
          return true;
        });
        return value;
      }
      return null;
    };

    return FormioExportUtils.isFormioSubmission(data) ? search(data.data) : search(data);
  },

  /**
   * Interpolate a string and add data replacements.
   *
   * @param string
   *   The template string to use for interpolation
   * @param data
   *   The data object to interpolate
   * @returns {XML|string|*|void}
   */
  interpolate (string, data) {
    const templateSettings = {
      evaluate: /\{%(.+?)%\}/g,
      interpolate: /\{\{(.+?)\}\}/g,
      escape: /\{\{\{(.+?)\}\}\}/g
    };

    try {
      return _.template(string, templateSettings)(data);
    } catch (err) {
      console.warn('Error interpolating template', err, string, data);
      return null;
    }
  },

  /**
   * Iterate through each component within a form.
   *
   * @param {Object} components
   *   The components to iterate.
   * @param {Function} fn
   *   The iteration function to invoke for each component.
   * @param {Boolean} includeAll
   *   Whether or not to include layout components.
   * @param {String} path
   *   The current data path of the element. Example: data.user.firstName
   * @param {Object} parent
   *   The parent object.
   */
  eachComponent (components, fn, includeAll, path, parent) {
    if (!components) return;
    path = path || '';
    components.forEach((component) => {
      const hasColumns = component.columns && Array.isArray(component.columns);
      const hasRows = component.rows && Array.isArray(component.rows);
      const hasComps = component.components && Array.isArray(component.components);
      let noRecurse = false;
      const newPath = component.key ? (path ? (`${path}.${component.key}`) : component.key) : '';

      // Keep track of parent references.
      if (parent) {
        // Ensure we don't create infinite JSON structures.
        component.parent = _.clone(parent);
        delete component.parent.components;
        delete component.parent.componentMap;
        delete component.parent.columns;
        delete component.parent.rows;
      }

      if (includeAll || component.tree || (!hasColumns && !hasRows && !hasComps)) {
        noRecurse = fn(component, newPath);
      }

      const subPath = () => {
        if (
          component.key &&
          (
            ['datagrid', 'container', 'editgrid'].includes(component.type) ||
            component.tree
          )
        ) {
          return newPath;
        } else if (
          component.key &&
          component.type === 'form'
        ) {
          return `${newPath}.data`;
        }
        return path;
      };

      if (!noRecurse) {
        if (hasColumns) {
          component.columns.forEach((column) =>
            FormioExportUtils.eachComponent(column.components, fn, includeAll, subPath(), parent ? component : null));
        } else if (hasRows) {
          component.rows.forEach((row) => row.forEach((column) =>
            FormioExportUtils.eachComponent(column.components, fn, includeAll, subPath(), parent ? component : null)));
        } else if (hasComps) {
          FormioExportUtils.eachComponent(component.components, fn, includeAll, subPath(), parent ? component : null);
        }
      }
    });
  },

  /**
   * Creates a DOM element with optional attributes and children elements.
   *
   * @param {String} tag
   *   The DOM element tag name
   * @param {any} args
   *   The DOM element attributes and / or children nodes
   * @returns {Element}
   *   The DOM element
   */
  createElement (tag, ...args) {
    let el = document.createElement(tag);
    let attributes = {};

    // check if there are attributes defined
    if (!!args[0] && typeof args[0] === 'object') {
      attributes = args[0];
      // ...and remove them from args
      args = args.slice(1);
    }
    // check if HTML style is defined as object
    if (!!attributes.style && typeof attributes.style === 'object') {
      // transform the style object into string
      attributes.style = _.map(attributes.style, (value, key) => {
        return `${key}:${value}`;
      }).join(';');
    }
    // check if innerHTML is defined
    if (attributes.hasOwnProperty('innerHTML')) {
      // ...and delete the original innerHTML property
      el.innerHTML = attributes.innerHTML;
      delete attributes.innerHTML;
    } else {
      // create HTML element with supplied attributes and children (if any)
      _.forEach(args, (arg) => {
        if (_.isString(arg)) {
          el.appendChild(document.createTextNode(arg));
        } else if (_.isElement(arg) || (_.isObject(arg) && arg.nodeType > 0)) {
          el.appendChild(arg);
        }
      });
    }

    _.forEach(attributes, (value, key) => {
      el.setAttribute(key, value);
    });
    // return the created HTML element
    return el;
  }
};

export default FormioExportUtils;
