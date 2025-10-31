import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect, useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  selectRoot,
  deleteForm,
} from "@aot-technologies/formio-react";
import Loading from "../../../containers/Loading";
import {
  setBPMFormListLoading,
  setFormDeleteStatus,
  setBpmFormSearch,
  setBPMFormListPage,
} from "../../../actions/formActions";
import { fetchBPMFormList } from "../../../apiManager/services/bpmFormServices";
import {
  setFormCheckList,
  setFormSearchLoading,
} from "../../../actions/checkListActions";
import { useTranslation, Translation } from "react-i18next";
import { unPublishForm } from "../../../apiManager/services/processServices";
import FormTable from "./../../../components/Form/constants/FormTable.js";
import ClientTable from "./../../../components/Form/constants/ClientTable";
import _ from "lodash";
import userRoles from "../../../constants/permissions.js";
import {
  CustomSearch,
  V8CustomButton,
  Alert,
  AlertVariant,
  CustomProgressBar
} from "@formsflow/components";
import { navigateToDesignFormBuild } from "../../../helper/routerHelper.js";

const List = React.memo((props) => {
  const { createDesigns, createSubmissions, viewDesigns } = userRoles();
  const { t } = useTranslation();
  const searchText = useSelector((state) => state.bpmForms.searchText);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const [search, setSearch] = useState(searchText || "");
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [duplicateProgress, setDuplicateProgress] = useState(0);
  const dispatch = useDispatch();

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
  // const handleClearSearch = () => {
  //   setSearch("");
  //   dispatch(setBpmFormSearch(""));
  // };
  const { forms } = props;
  const isBPMFormListLoading = useSelector((state) => state.bpmForms.isActive);
  const designerFormLoading = useSelector(
    (state) => state.formCheckList.designerFormLoading
  );

  const pageNo = useSelector((state) => state.bpmForms.formListPage);
  const limit = useSelector((state) => state.bpmForms.limit);
  const formSort = useSelector((state) => state.bpmForms.sort);
  const searchFormLoading = useSelector(
    (state) => state.formCheckList.searchFormLoading
  );
  useEffect(() => {
    dispatch(setFormCheckList([]));
  }, [dispatch]);

  useEffect(() => {
    dispatch(setBPMFormListLoading(true));
  }, []);

  const fetchForms = () => {
    let filters = {pageNo, limit, formSort, formName:searchText};
    dispatch(setFormSearchLoading(true));
    dispatch(fetchBPMFormList({...filters}));
  };
  useEffect(() => {
    fetchForms();
  }, [dispatch, createDesigns, pageNo, limit, formSort, searchText]);

  const renderTable = () => {
    if (createDesigns || viewDesigns) {
      return <FormTable 
               isDuplicating={isDuplicating} 
               setIsDuplicating={setIsDuplicating}
               setDuplicateProgress={setDuplicateProgress}/>;
    }
    if (createSubmissions) {
      return <ClientTable />;
    }
    return null;
  };


  return (
    <>
      {(forms?.isActive || designerFormLoading || isBPMFormListLoading) &&
      !searchFormLoading ? (
        <div data-testid="Form-list-component-loader">
          <Loading />
        </div>
      ) : (
        <>
                <div className="toast-section">
                        <Alert
                          message={t("Duplicating the form")}
                          variant={AlertVariant.FOCUS}
                          isShowing={isDuplicating}
                          rightContent={<CustomProgressBar progress={duplicateProgress} />}
                        />
                </div> 
                
                <div className="header-section-1">
                    <div className="section-seperation-left">
                        <h4> Build</h4>  
                    </div>
                    <div className="section-seperation-right">
                        <V8CustomButton
                            label={t("Create New Form")}
                            onClick={() => navigateToDesignFormBuild(dispatch, tenantKey)}
                            dataTestId="create-form-button"
                            ariaLabel="Create Form"
                            variant="primary"
                        />
                    </div>
                </div>

                <div className="header-section-2">
                  <div className="section-seperation-left">
                                <CustomSearch
                                  search={search}
                                  setSearch={setSearch}
                                  handleSearch={handleSearch}

                                  placeholder={t("Search Form Name and Description")}
                                  searchLoading={searchFormLoading}
                                  title={t("Search Form Name and Description")}
                                  dataTestId="form-search-input"
                                  width="22rem"
                                />
                    </div>
                 </div>

                 <div className="body-section">
                    {renderTable()}
                 </div>

        </>
      )}
    </>
  );
});
List.propTypes = {
  forms: PropTypes.object,
};
const mapStateToProps = (state) => {
  return {
    forms: selectRoot("forms", state),
    userRoles: selectRoot("user", state).roles || [],
    modalOpen: selectRoot("formDelete", state).formDelete.modalOpen,
    formId: selectRoot("formDelete", state).formDelete.formId,
    formName: selectRoot("formDelete", state).formDelete.formName,
    isFormWorkflowSaved: selectRoot("formDelete", state).isFormWorkflowSaved,
    tenants: selectRoot("tenants", state),
    path: selectRoot("formDelete", state)?.formDelete.path,
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
                  {(t) =>
                    t(
                      `${_.capitalize(
                        formProcessData?.formType
                      )} deletion unsuccessful`
                    )
                  }
                </Translation>
              );
            } else {
              toast.success(
                <Translation>
                  {(t) =>
                    t(
                      `${_.capitalize(
                        formProcessData?.formType
                      )} deleted successfully`
                    )
                  }
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
