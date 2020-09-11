import React, {Component} from 'react';
import PropTypes from 'prop-types';
import AllComponents from 'formiojs/components';
import Components from 'formiojs/components/Components';
import FormioFormBuilder from 'formiojs/FormBuilder';

Components.setComponents(AllComponents);

export default class FormBuilder extends Component {
  static defaultProps = {
    options: {},
    Builder: FormioFormBuilder
  };

  static propTypes = {
    form: PropTypes.object,
    options: PropTypes.object,
    onSaveComponent: PropTypes.func,
    onUpdateComponent: PropTypes.func,
    onDeleteComponent: PropTypes.func,
    onCancelComponent: PropTypes.func,
    onEditComponent: PropTypes.func,
    Builder: PropTypes.any
  };

  componentDidMount = () => {
    this.initializeBuilder(this.props);
  };

  componentWillUnmount = () => {
    if (this.builder !== undefined) {
      this.builder.instance.destroy(true);
    }
  };

  initializeBuilder = (props) => {
    const options = Object.assign({}, props.options);
    const form = Object.assign({}, props.form);
    const Builder = props.Builder;

    if (this.builder !== undefined) {
      this.builder.instance.destroy(true);
    }

    this.builder = new Builder(this.element.firstChild, form, options);
    this.builderReady = this.builder.ready;

    this.builderReady.then(() => {
      this.onChange();
      this.builder.instance.on('saveComponent', this.emit('onSaveComponent'));
      this.builder.instance.on('updateComponent', this.emit('onUpdateComponent'));
      this.builder.instance.on('removeComponent', this.emit('onDeleteComponent'));
      this.builder.instance.on('cancelComponent', this.emit('onCancelComponent'));
      this.builder.instance.on('editComponent', this.emit('onEditComponent'));
      this.builder.instance.on('addComponent', this.onChange);
      this.builder.instance.on('saveComponent', this.onChange);
      this.builder.instance.on('updateComponent', this.onChange);
      this.builder.instance.on('removeComponent', this.onChange);
      this.builder.instance.on('deleteComponent', this.onChange);
      this.builder.instance.on('pdfUploaded', this.onChange);
    });
  };

  componentWillReceiveProps = (nextProps) => {
    const {options, form} = this.props;

    if (
      (form.display !== nextProps.form.display)
      || (options !== nextProps.options)
      || (form.components !== nextProps.form.components)
    ) {
      this.initializeBuilder(nextProps);
    }
  };

  render = () => {
    return <div ref={element => this.element = element}>
      <div></div>
    </div>;
  };

  onChange = () => {
    if (this.props.hasOwnProperty('onChange') && typeof this.props.onChange === 'function') {
      this.props.onChange(this.builder.instance.form);
    }
  };

  emit = (funcName) => {
    return (...args) => {
      if (this.props.hasOwnProperty(funcName) && typeof (this.props[funcName]) === 'function') {
        this.props[funcName](...args);
      }
    };
  };
}
