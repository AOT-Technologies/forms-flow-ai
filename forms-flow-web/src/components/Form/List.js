import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { Link } from 'react-router-dom'
import { indexForms, selectRoot, selectError, Errors, FormGrid,deleteForm, resetForms, } from 'react-formio';

import Loading from "../../containers/Loading";
import {OPERATIONS, CLIENT, STAFF_DESIGNER, STAFF_REVIEWER} from "../../constants/constants"
import '../Form/List.scss'
import {setFormDeleteStatus} from '../../actions/formActions'
import Confirm from '../../containers/Confirm';

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
      <div className="container">
            <Confirm modalOpen={this.props.modalOpen}
      message={`Are you sure you wish to delete the form ?`}
      onNo={() =>this.props.onNo()}
      onYes={() =>this.props.onYes(this.props.formId)}
      >
      </Confirm>
        <div className="main-header">
          <img src="/form.svg" width="30" height="30" alt="form"/>
          <h3 className="task-head">Forms</h3>
          {userRoles.includes(STAFF_DESIGNER) ?<Link to="/form/create" className="btn btn-primary btn-right btn-sm">
          <i className="fa fa-plus"></i> Create Form
        </Link>:null}
        </div>
        <section className="custom-grid">
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
      operations.push(OPERATIONS.viewForm, OPERATIONS.edit, OPERATIONS.delete);
    }
    return operations;
  }

}

const mapStateToProps = (state) => {
  return {
    forms: selectRoot('forms', state),
    errors: selectError('forms', state),
    userRoles: selectRoot('user',state).roles||[],
    modalOpen: selectRoot('formDelete',state).formDelete.modalOpen,
    formId: selectRoot('formDelete',state).formDelete.formId,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getForms: (page, query) => {
      dispatch(indexForms('forms', page, query))
    },
    onAction: (form, action) => {
      switch (action) {
        case 'insert':
          dispatch(push(`/form/${form._id}`));
          break;
        case 'submission':
            dispatch(push(`/form/${form._id}/submission`));
          break;
        case 'edit':
            dispatch(push(`/form/${form._id}/edit`));
          break;
        case 'delete':
            const formDetails={modalOpen:true,formId:form._id}
            //dispatch(push(`/form/${form._id}/delete`));
            dispatch(setFormDeleteStatus(formDetails))
          break;
        case 'viewForm':
            dispatch(push(`/form/${form._id}/preview`));
          break;
        default:
      }
    },
    onYes: (formId) => {
      dispatch(deleteForm('submission', formId,  (err) => {
        if (!err) {
          dispatch(resetForms('forms'));
        }
      }));
    },
    onNo: () => {
      const formDetails={modalOpen:false,formId:""}
      dispatch(setFormDeleteStatus(formDetails))
    }
  }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(List);
