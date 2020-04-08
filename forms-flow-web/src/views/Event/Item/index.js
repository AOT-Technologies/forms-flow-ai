import { Link, Route, Switch } from 'react-router-dom'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import View from './View'
import Edit from './Edit'
import Delete from './Delete'
import {getForm, getSubmission} from "react-formio";

const Item = class extends Component {
  constructor() {
    super();

    this.state = {
      eventId: ''
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.match.params.eventId !== prevState.eventId) {
      nextProps.getForm();
      nextProps.getSubmission(nextProps.match.params.eventId);
    }

    return {
      eventId: nextProps.match.params.eventId
    };
  }

  render() {
    const {match: {params: {eventId}}} = this.props;
    return (
      <div>
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <Link className="nav-link" to={`/event`}>
              <i className="fa fa-chevron-left"></i>
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to={`/event/${eventId}`}>
              <i className="fa fa-eye"></i> View
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to={`/event/${eventId}/edit`}>
              <i className="fa fa-edit"></i> Edit
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to={`/event/${eventId}/delete`}>
              <i className="fa fa-trash"></i> Delete
            </Link>
          </li>
        </ul>
        <Switch>
          <Route exact path="/event/:eventId" component={View} />
          <Route path="/event/:eventId/edit" component={Edit} />
          <Route path="/event/:eventId/delete" component={Delete} />
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
    getForm: () => dispatch(getForm('event')),
    getSubmission: (id) => dispatch(getSubmission('event', id))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Item)
