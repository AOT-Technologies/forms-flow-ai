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
  setFormDeleteStatus, setMaintainBPMFormPagination
} from "../../actions/formActions";
import Confirm from "../../containers/Confirm";
import {fetchBPMFormList} from "../../apiManager/services/bpmFormServices";

const getOperations = (userRoles, showViewSubmissions) => {
  let operations = [];
  if (userRoles.includes(CLIENT) || userRoles.includes(STAFF_REVIEWER)) {
    operations.push(OPERATIONS.insert);
  }
  if (userRoles.includes(STAFF_REVIEWER) && showViewSubmissions) {
    operations.push(OPERATIONS.submission);
  }
  if (userRoles.includes(STAFF_DESIGNER)) {
    operations.push(OPERATIONS.viewForm, OPERATIONS.delete); //  OPERATIONS.edit,
  }
  return operations;
}

const List = React.memo((props)=> {
  const dispatch = useDispatch();
  const {
    forms,
    onAction,
    getForms,
    getFormsInit,
    errors,
    userRoles,
    formId,
    onNo,
    onYes,
  } = props;
  const isBPMFormListLoading = useSelector(state=> state.bpmForms.isActive);
  const bpmForms = useSelector(state=> state.bpmForms);
  const showViewSubmissions= useSelector((state) => state.user.showViewSubmissions);
  const isDesigner = userRoles.includes(STAFF_DESIGNER);
 /* const formPagination = useSelector(state=> state.forms.pagination);
  const maintainPagination = useSelector(state=>state.bpmForms.maintainPagination)
*/
  const operations = getOperations(userRoles, showViewSubmissions);

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
      getFormsInit(1);
    }else {
      dispatch(setBPMFormListLoading(true))
      dispatch(fetchBPMFormList());
    }
  },[getFormsInit, dispatch, isDesigner])

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
          <h3 className="task-head">
          <i className="fa fa-wpforms" aria-hidden="true"/>
             <span className="forms-text">Forms</span></h3>
          {userRoles.includes(STAFF_DESIGNER) && (
            <Link
              to="/formflow/create"
              className="btn btn-primary btn-right btn-sm"
            >
              <i className="fa fa-plus fa-lg" /> Create Form
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
});

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

const getInitForms =  (page=1, query)=>{
  return (dispatch, getState) => {
    const state = getState();
    const currentPage =state.forms.pagination.page;
    const maintainPagination = state.bpmForms.maintainPagination;
    dispatch(indexForms("forms", maintainPagination?currentPage:page, query));
  }
}

const mapDispatchToProps = (dispatch,ownProps) => {
  return {
    getForms: (page, query) => {
      dispatch(indexForms("forms", page, query));
    },
    getFormsInit: (page, query) => {
      dispatch(getInitForms( page, query));
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
          dispatch(setMaintainBPMFormPagination(true));
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
