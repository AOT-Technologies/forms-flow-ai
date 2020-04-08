import React, {Component} from 'react';
import { connect } from 'react-redux';

class ProtectAnon extends Component {
  render() {
    const {authenticated, goToState} = this.props;

    if (authenticated) {
      //return <div>Unauthorized</div>;
      goToState();
    }
    else {
      return this.props.children;
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    authenticated: ownProps.formio.auth.selectors.getAuthenticated(state)
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    goToState: () => ownProps.router.go('/' + ownProps.formio.auth.config.authState)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProtectAnon);
