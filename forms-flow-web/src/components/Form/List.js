import React, {useEffect} from "react";
import {connect, useDispatch, useSelector} from "react-redux";
import { push } from "connected-react-router";
import { Link } from "react-router-dom";

import {
  indexForms,
  selectRoot,
  selectError,
  Errors,
  FormGrid,
  deleteForm,
} from "react-formio";

import Loading from "../../containers/Loading";
import {
  OPERATIONS,
  CLIENT,
  STAFF_DESIGNER,
  STAFF_REVIEWER,
} from "../../constants/constants";
import "../Form/List.scss";
import {
  setBPMFormLimit,
  setBPMFormListLoading,
  setBPMFormListPage, setBPMFormListSort,
  setFormDeleteStatus
} from "../../actions/formActions";
import Confirm from "../../containers/Confirm";
import {fetchBPMFormList} from "../../apiManager/services/bpmFormServices";

const getOperations = (userRoles) => {
  let operations = [];
  if (userRoles.includes(CLIENT) || userRoles.includes(STAFF_REVIEWER)) {
    operations.push(OPERATIONS.insert);
  }
  if (userRoles.includes(STAFF_REVIEWER)) {
    operations.push(OPERATIONS.submission);
  }
  if (userRoles.includes(STAFF_DESIGNER)) {
    operations.push(OPERATIONS.viewForm, OPERATIONS.delete); //  OPERATIONS.edit,
  }
  return operations;
}

const List = (props)=> {
  const dispatch = useDispatch();
  const {
    forms,
    onAction,
    getForms,
    errors,
    userRoles,
    formId,
    onNo,
    onYes,
  } = props;
  const isBPMFormListLoading = useSelector(state=> state.bpmForms.isActive);
  const bpmForms = useSelector(state=> state.bpmForms);
  const isDesigner = userRoles.includes(STAFF_DESIGNER);
  const operations = getOperations(userRoles);

  const getFormsList = (page,query)=>{
    if(page){
      dispatch(setBPMFormListPage(page));
    }
    if(query){
      dispatch(setBPMFormListSort(query.sort||''));
    }
  }

  const onPageSizeChanged=(pageSize)=>{
    dispatch(setBPMFormLimit(pageSize));
  }

  useEffect(()=>{
    if(isDesigner){
      getForms(1);
    }else {
      dispatch(setBPMFormListLoading(true))
      dispatch(fetchBPMFormList());
    }
  },[getForms,dispatch, isDesigner])

  if (forms.isActive || isBPMFormListLoading) {
      return <Loading />;
  }

    return (
      <div className="container">
        <Confirm
          modalOpen={props.modalOpen}
          message={
            "Are you sure you wish to delete the form " +
            props.formName +
            "?"
          }
          onNo={() => onNo()}
          onYes={() => onYes(formId, forms)}
        />
        <div className="main-header">
          {/*<img src="/form.svg" width="30" height="30" alt="form" />*/}
          <h3 className="task-head"><i className="fa fa-wpforms" aria-hidden="true"/> &nbsp; Forms</h3>
          {userRoles.includes(STAFF_DESIGNER) && (
            <Link
              to="/formflow/create"
              className="btn btn-primary btn-right btn-sm"
            >
              <i className="fa fa-plus" /> Create Form
            </Link>
          )}
        </div>
        <section className="custom-grid grid-forms">
          <Errors errors={errors} />
          <FormGrid
            forms={isDesigner?forms:bpmForms}
            onAction={onAction}
            getForms={isDesigner?getForms:getFormsList}
            operations={operations}
            onPageSizeChanged={isDesigner?()=>{}:onPageSizeChanged}
          />
        </section>
      </div>
    );
};

const mapStateToProps = (state) => {
  return {
    forms: selectRoot("forms", state),
    errors: selectError("forms", state),
    userRoles: selectRoot("user", state).roles || [],
    modalOpen: selectRoot("formDelete", state).formDelete.modalOpen,
    formId: selectRoot("formDelete", state).formDelete.formId,
    formName: selectRoot("formDelete", state).formDelete.formName,
    isFormWorkflowSaved: selectRoot("formDelete", state).isFormWorkflowSaved,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getForms: (page, query) => {
      dispatch(indexForms("forms", page, query));
    },
    onAction: (form, action) => {
      switch (action) {
        case "insert":
          dispatch(push(`/form/${form._id}`));
          break;
        case "submission":
          dispatch(push(`/form/${form._id}/submission`));
          break;
        // case "edit":
        //   dispatch(push(`/form/${form._id}/edit`));
        //   break;
        case "delete":
          const formDetails = {
            modalOpen: true,
            formId: form._id,
            formName: form.title,
          };
          dispatch(setFormDeleteStatus(formDetails));
          break;
        case "viewForm":
          dispatch(push(`/formflow/${form._id}/view-edit`));
          break;
        default:
      }
    },
    onYes: (formId, forms) => {
      dispatch(
        deleteForm("form", formId, (err) => {
          if (!err) {
            const formDetails = { modalOpen: false, formId: "", formName: "" };
            dispatch(setFormDeleteStatus(formDetails));
            dispatch(indexForms("forms", 1, forms.query));
          }
        })
      );
    },
    onNo: () => {
      const formDetails = { modalOpen: false, formId: "", formName: "" };
      dispatch(setFormDeleteStatus(formDetails));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(List);
