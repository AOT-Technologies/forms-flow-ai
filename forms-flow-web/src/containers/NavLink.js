import React, {Component} from 'react';
import {Link, withRouter, matchPath} from 'react-router-dom';
import PropTypes from 'prop-types';

class NavLink extends Component {
  static propTypes = {
    to: PropTypes.string.isRequired,
    exact: PropTypes.bool
  };

  static defaultProps = {
    exact: false
  };

  render() {
    const {to, location, exact, role, className, children} = this.props;

    const liClass = matchPath(location.pathname, {
      path: to,
      exact,
      strict: false
    }) ? 'nav-item active' : 'nav-item';

    return (
      <li className={liClass}>
        <Link {...{to, role, className}}>{children}</Link>
      </li>
    );
  }
}

export default withRouter(props => <NavLink {...props}/>)
