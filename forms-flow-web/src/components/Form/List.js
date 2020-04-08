import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { Link } from 'react-router-dom'
import { indexForms, selectRoot, selectError, Errors, FormGrid } from 'react-formio';
import Loading from "../../containers/Loading";
import {OPERATIONS, CLIENT, STAFF_DESIGNER, STAFF_REVIEWER} from "../../constants/constants"
const List = class extends Component {
  componentWillMount() {
    this.props.getForms(1);
  }

  render() {
    const { forms, onAction, getForms, errors, userRoles } = this.props;
    const operations =  this.getOperations(userRoles);
    if (forms.isActive) {
      return (
        <Loading />
      );
    }

    return (
      <div>
        <header>
          <h3>Forms</h3>
          {userRoles.includes(STAFF_DESIGNER) ?<Link to="/create">
            <button className="btn btn-primary btn-sm form-btn pull-right"><i className="fa fa-plus"></i> Create Form</button>
          </Link>:null}
        </header>
        <section className="mt-5">
          <Errors errors={errors} />
          <FormGrid
            forms={forms}
            onAction={onAction}
            getForms={getForms}
            operations={operations}
          />
        </section>
      </div>
    )
  }

  getOperations(userRoles) {
    let operations = [];
    //TODO MOVE userROles and staff_designer to constants
    if(userRoles.includes(STAFF_REVIEWER)||userRoles.includes(CLIENT)){
      operations.push(OPERATIONS.insert,OPERATIONS.submission);
    }
    if(userRoles.includes(STAFF_DESIGNER)){
      operations.push(OPERATIONS.edit, OPERATIONS.delete);
    }
    return operations;
  }

}

const mapStateToProps = (state) => {
  return {
    forms: selectRoot('forms', state),
    errors: selectError('forms', state),
    userRoles: localStorage.getItem('UserRoles')
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getForms: (page, query) => {
      dispatch(indexForms('forms', page, query))
    },
    onAction: (form, action) => {
      console.log('Delete',action)
      switch (action) {
        case 'view':
          dispatch(push(`/${form._id}`));
          break;
        case 'submission':
            dispatch(push(`/${form._id}/submission`));
          break;
        case 'edit':
            dispatch(push(`/${form._id}/edit`));
          break;
        case 'delete':
            dispatch(push(`/${form._id}/delete`));
          break;
        default:
      }
    }
  }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(List);
