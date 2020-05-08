import { Link, Route, Switch } from 'react-router-dom'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getSubmission } from "react-formio";

import View from './View'
import Edit from './Edit'

const Item = class extends Component {
  constructor() {
    super();

    this.state = {
      submissionId: ''
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.match.params.submissionId !== prevState.submissionId) {
      nextProps.getSubmission(nextProps.match.params.submissionId);
    }

    return {
      submissionId: nextProps.match.params.submissionId
    };
  }
  render() {
    const { match: { params: { formId, submissionId } } } = this.props;
    let path = this.props.location.pathname;
    return (
      <div>
        {(path.indexOf("delete") < 0) ?
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <Link className="nav-link" to={`/form/${formId}/submission`}>
                <i className="fa fa-chevron-left"></i>
              </Link>
            </li>
            {(path.indexOf("edit") > 0) ?
              <li className="nav-item">
                <Link className="nav-link" to={`/form/${formId}/submission/${submissionId}`}>
                  <i className="fa fa-eye"></i> View
            </Link>
              </li>
              :
              <li className="nav-item">
                <Link className="nav-link" to={`/form/${formId}/submission/${submissionId}/edit`}>
                  <i className="fa fa-edit"></i> Edit
            </Link>
              </li>
            }
          </ul>
          :
          null
        }
        <Switch>
          <Route exact path="/form/:formId/submission/:submissionId" component={View} />
          <Route path="/form/:formId/submission/:submissionId/edit" component={Edit} />
        </Switch>
      </div>
    )
  }
}

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    getSubmission: (id) => dispatch(getSubmission('submission', id, ownProps.match.params.formId))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Item)
