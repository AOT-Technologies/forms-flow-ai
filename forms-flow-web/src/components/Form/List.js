import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { push } from "connected-react-router";
import { toast } from "react-toastify";
import {
  InputGroup,
  FormControl,
} from "react-bootstrap";
import { selectRoot, selectError, Errors, deleteForm } from "react-formio";
import Loading from "../../containers/Loading";
import  userRoles  from "../../constants/permissions.js";
import {
  MULTITENANCY_ENABLED,
} from "../../constants/constants";
import "../Form/List.scss";
import {
  setBPMFormListLoading,
  setFormDeleteStatus,
  setBpmFormSearch,
  setBPMFormListPage,
} from "../../actions/formActions";
import {
  fetchBPMFormList
} from "../../apiManager/services/bpmFormServices";
import {
  setFormCheckList,
  setFormSearchLoading
} from "../../actions/checkListActions";
import { useTranslation, Translation } from "react-i18next";
import {
  unPublishForm,
} from "../../apiManager/services/processServices";
import FormTable from "./constants/FormTable";
import ClientTable from "./constants/ClientTable";
import _ from "lodash";
const List = React.memo((props) => {
  const { createDesigns, createSubmissions, viewDesigns} = userRoles();
  const { t } = useTranslation();
  const searchText = useSelector((state) => state.bpmForms.searchText);
  const [search, setSearch] = useState(searchText || "");
  useEffect(() => {
    setSearch(searchText);
  }, [searchText]);

  useEffect(() => {
    if (!search?.trim()) {
      dispatch(setBpmFormSearch(""));
    }
  }, [search]);
  const handleSearch = () => {
    dispatch(setBpmFormSearch(search));
    dispatch(setBPMFormListPage(1));
  };
  const handleClearSearch = () => {
    setSearch("");
    dispatch(setBpmFormSearch(""));
  };
  const dispatch = useDispatch();
  const {
    forms,
    getFormsInit,
    errors,
    tenants,
  } = props;
  const isBPMFormListLoading = useSelector((state) => state.bpmForms.isActive);
  const designerFormLoading = useSelector(
    (state) => state.formCheckList.designerFormLoading
  );

  const pageNo = useSelector((state) => state.bpmForms.page);
  const limit = useSelector((state) => state.bpmForms.limit);
  const sortBy = useSelector((state) => state.bpmForms.sortBy);
  const sortOrder = useSelector((state) => state.bpmForms.sortOrder);
  const searchFormLoading = useSelector(
    (state) => state.formCheckList.searchFormLoading
  );
  const tenantKey = tenants?.tenantId;
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";

  useEffect(() => {
    dispatch(setFormCheckList([]));
  }, [dispatch]);

  useEffect(() => {
    dispatch(setBPMFormListLoading(true));
  }, []);

  const fetchForms = () => {
    let filters = [pageNo, limit, sortBy, sortOrder, searchText];
    dispatch(setFormSearchLoading(true));
    dispatch(fetchBPMFormList(...filters));
  };

  useEffect(() => {
    fetchForms();
  }, [
    getFormsInit,
    dispatch,
    createDesigns,
    pageNo,
    limit,
    sortBy,
    sortOrder,
    searchText,
  ]);

  return (
    <>
      {(forms.isActive || designerFormLoading || isBPMFormListLoading) &&
        !searchFormLoading ? (
        <div data-testid="Form-list-component-loader">
          <Loading />
        </div>
      ) : (
        <div>
          <Errors errors={errors} />
          {createDesigns && (
            <>
              <div className="d-md-flex  justify-content-between align-items-center pb-3">

                <InputGroup className="input-group p-0 search-box" style={{ width: "24%" }}>
                  <FormControl
                    className="bg-white out-line search-box"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                    }}
                    onKeyDown={(e) => (e.keyCode == 13 ? handleSearch() : "")}
                    placeholder={t("Search by form title")}
                    title={t("Search Form Name and Description")}
                    data-testid="form-search-input-box"
                    aria-label={t("Search by form title")}
                  />
                  {search && (
                    <InputGroup.Append onClick={handleClearSearch} data-testid="form-search-clear-button">
                      <InputGroup.Text className="h-100">
                        <i className="fa fa-times"></i>
                      </InputGroup.Text>
                    </InputGroup.Append>
                  )}
                </InputGroup>
                <div className=" d-md-flex justify-content-end align-items-center">
                  {createDesigns && (
                    <button
                      data-testid="create-form-btn"
                      onClick={() =>
                        dispatch(push(`${redirectUrl}formflow/create`))
                      }
                      className="btn btn-primary text-nowrap mx-2"
                    >
                      {/* <i className="fa fa-plus me-2" /> */}
                      <Translation>{(t) => t("New Form")}</Translation>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {createDesigns || viewDesigns ? <FormTable /> : 
          createSubmissions ? <ClientTable /> : null}
        </div>
      )}
    </>
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
    tenants: selectRoot("tenants", state),
    path: selectRoot("formDelete", state).formDelete.path,
  };
};

// eslint-disable-next-line no-unused-vars
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onYes: (
      e,
      formId,
      formProcessData,
      formCheckList,
      applicationCount,
      fetchForms
    ) => {
      e.currentTarget.disabled = true;
      if (!applicationCount) {
        dispatch(deleteForm("form", formId));
      }
      if (formProcessData.id) {
        dispatch(
          unPublishForm(formProcessData.id, (err) => {
            if (err) {
              toast.error(
                <Translation>
                  {(t) => t(`${_.capitalize(formProcessData?.formType)} deletion unsuccessful`)}
                </Translation>
              );
            } else {
              toast.success(
                <Translation>
                  {(t) => t(`${_.capitalize(formProcessData?.formType)} deleted successfully`)}
                </Translation>
              );
              const newFormCheckList = formCheckList.filter(
                (i) => i.formId !== formId
              );
              dispatch(setFormCheckList(newFormCheckList));
            }
            fetchForms();
          })
        );
      }
      const formDetails = {
        modalOpen: false,
        formId: "",
        formName: "",
      };
      dispatch(setFormDeleteStatus(formDetails));
    },
    onNo: () => {
      const formDetails = { modalOpen: false, formId: "", formName: "" };
      dispatch(setFormDeleteStatus(formDetails));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(List);  
