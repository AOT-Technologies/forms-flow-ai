import { Link, Route, Switch } from 'react-router-dom'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import View from './View'
import Edit from './Edit'
import Delete from './Delete'
import {getSubmission} from "react-formio";

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
    const {match: {params: {formId, submissionId}}} = this.props;
    return (
      <div>
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <Link className="nav-link" to={`/form/${formId}/submission`}>
              <i className="fa fa-chevron-left"></i>
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to={`/form/${formId}/submission/${submissionId}`}>
              <i className="fa fa-eye"></i> View
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to={`/form/${formId}/submission/${submissionId}/edit`}>
              <i className="fa fa-edit"></i> Edit
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to={`/form/${formId}/submission/${submissionId}/delete`}>
              <i className="fa fa-trash"></i> Delete
            </Link>
          </li>
        </ul>
        <Switch>
          <Route exact path="/form/:formId/submission/:submissionId" component={View} />
          <Route path="/form/:formId/submission/:submissionId/edit" component={Edit} />
          <Route path="/form/:formId/submission/:submissionId/delete" component={Delete} />
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
