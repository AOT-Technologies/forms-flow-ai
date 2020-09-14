import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class Errors extends Component {
  static propTypes = {
    errors: PropTypes.any,
    type: PropTypes.string
  }

  static defaultProps = {
    type: 'danger'
  }

  hasErrors(error) {
    if (Array.isArray(error)) {
      return error.filter(item => !!item).length !== 0;
    }

    return !!error;
  }

  formatError(error) {
    if (typeof error === 'string') {
      return error;
    }

    if (Array.isArray(error)) {
      return error.map(this.formatError);
    }

    if (error.hasOwnProperty('errors')) {
      return Object.keys(error.errors).map((key, index) => {
        const item = error.errors[key];
        return (
          <div key={index}>
            <strong>{item.name} ({item.path})</strong> - {item.message}
          </div>
        );
      });
    }

    // If this is a standard error.
    if (error.hasOwnProperty('message')) {
      return error.message;
    }

    // If this is a joy validation error.
    if (error.hasOwnProperty('name') && error.name === 'ValidationError') {
      return error.details.map((item, index) => {
        return (
          <div key={index}>
            {item.message}
          </div>
        );
      });
    }

    // If a conflict error occurs on a form, the form is returned.
    if (error.hasOwnProperty('_id') && error.hasOwnProperty('display')) {
      return 'Another user has saved this form already. Please reload and re-apply your changes.';
    }

    return 'An error occurred. See console logs for details.';
  }

  render() {
    // If there are no errors, don't render anything.
    if (!this.hasErrors(this.props.errors)) {
      return null;
    }

    return (
      <div className={`alert alert-${this.props.type}`} role="alert">{this.formatError(this.props.errors)}</div>
    );
  }
}
