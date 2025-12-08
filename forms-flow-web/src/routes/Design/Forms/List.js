import React, { useEffect, useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { connect, useSelector, useDispatch, batch } from "react-redux";
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
  setBPMFormLimit,
  setBpmFormSort,
  setClientFormLimit,
  setClientFormListPage,
  setClientFormListSort,
  setClientFormSearch,
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
  CustomProgressBar,
  BreadCrumbs
} from "@formsflow/components";
import { navigateToDesignFormBuild } from "../../../helper/routerHelper.js";
import { getRoute } from "../../../constants/constants";

const List = React.memo((props) => {
  const { createDesigns, createSubmissions, viewDesigns } = userRoles();
  const { t } = useTranslation();
  const searchText = useSelector((state) => state.bpmForms.searchText);
  const clientSearchText = useSelector((state) => state.bpmForms.clientFormSearch);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const [search, setSearch] = useState(searchText || "");
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [duplicateProgress, setDuplicateProgress] = useState(0);
  const dispatch = useDispatch();
  
  const isDesignerMode = createDesigns || viewDesigns;
  const isSubmitterMode = !isDesignerMode && createSubmissions;

  useEffect(() => {
    if (isDesignerMode) {
      setSearch(searchText);
    } else if (isSubmitterMode) {
      setSearch(clientSearchText);
    }
  }, [searchText, clientSearchText, isDesignerMode, isSubmitterMode]);

  useEffect(() => {
    if (!search?.trim()) {
      if (isDesignerMode) {
        dispatch(setBpmFormSearch(""));
      } else if (isSubmitterMode) {
        dispatch(setClientFormSearch(""));
      }
    }
  }, [search, dispatch, isDesignerMode, isSubmitterMode]);
  
  const handleSearch = useCallback(() => {
    // Batch dispatches to prevent duplicate API calls
    batch(() => {
      if (isDesignerMode) {
        dispatch(setBpmFormSearch(search));
        dispatch(setBPMFormListPage(1));
      } else if (isSubmitterMode) {
        dispatch(setClientFormSearch(search));
        dispatch(setClientFormListPage(1));
      }
    });
  }, [dispatch, search, isDesignerMode, isSubmitterMode]);
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
  // Submitter pagination/sort
  const submitPageNo = useSelector((state) => state.bpmForms.submitListPage);
  const submitLimit = useSelector((state) => state.bpmForms.submitFormLimit);
  const submitFormSort = useSelector((state) => state.bpmForms.submitFormSort);
  const searchFormLoading = useSelector(
    (state) => state.formCheckList.searchFormLoading
  );
  
  useEffect(() => {
    dispatch(setFormCheckList([]));
  }, [dispatch]);

  // Fetch Designer Forms
  useEffect(() => {
    if (!isDesignerMode) {
      return;
    }
    const filters = { pageNo, limit, formSort, formName: searchText };
    batch(() => {
      dispatch(setBPMFormListLoading(true));
      dispatch(setFormSearchLoading(true));
      dispatch(fetchBPMFormList({ ...filters }));
    });
  }, [dispatch, pageNo, limit, formSort, searchText, isDesignerMode]);

  // Fetch Submitter Forms
  useEffect(() => {
    if (!isSubmitterMode) {
      return;
    }
    const filters = {
      pageNo: submitPageNo,
      limit: submitLimit,
      formSort: submitFormSort,
      formName: clientSearchText,
      showForOnlyCreateSubmissionUsers: true,
      includeSubmissionsCount: true
    };
    batch(() => {
      dispatch(setBPMFormListLoading(true));
      dispatch(setFormSearchLoading(true));
      dispatch(fetchBPMFormList({ ...filters }));
    });
  }, [dispatch, submitPageNo, submitLimit, submitFormSort, clientSearchText, isSubmitterMode]);

  // Designer mapping for sort field names
  const designerGridFieldToSortKey = {
    title: "formName",
    modified: "modified",
    anonymous: "visibility",
    status: "status",
  };
  const designerSortKeyToGridField = {
    formName: "title",
    modified: "modified",
    visibility: "anonymous",
    status: "status",
  };
  const designerActiveKey = formSort?.activeKey || "formName";
  const designerActiveField = designerSortKeyToGridField[designerActiveKey] || designerActiveKey;
  const designerActiveOrder = formSort?.[designerActiveKey]?.sortOrder || "asc";
  const designerSortModel = useMemo(
    () => [{ field: designerActiveField, sort: designerActiveOrder }],
    [designerActiveField, designerActiveOrder]
  );
  const designerPaginationModel = useMemo(
    () => ({ page: pageNo - 1, pageSize: limit }),
    [pageNo, limit]
  );
  const onDesignerPaginationModelChange = useCallback(({ page, pageSize }) => {
    batch(() => {
      if (pageSize !== limit) {
        dispatch(setBPMFormLimit(pageSize));
        dispatch(setBPMFormListPage(1));
      } else {
        dispatch(setBPMFormListPage(page + 1));
      }
    });
  }, [dispatch, limit]);
  
  const handleDesignerSortModelChange = useCallback((modelArray) => {
    const model = Array.isArray(modelArray) ? modelArray[0] : modelArray;
    if (!model?.field || !model?.sort) {
      const resetSort = Object.keys(formSort || {}).reduce((acc, key) => {
        acc[key] = { sortOrder: "asc" };
        return acc;
      }, {});
      dispatch(setBpmFormSort({ ...resetSort, activeKey: "formName" }));
      return;
    }
    const mappedKey = designerGridFieldToSortKey[model.field] || model.field;
    const updatedSort = Object.keys(formSort || {}).reduce((acc, columnKey) => {
      acc[columnKey] = { sortOrder: columnKey === mappedKey ? model.sort : "asc" };
      return acc;
    }, {});
    dispatch(setBpmFormSort({ ...updatedSort, activeKey: mappedKey }));
  }, [dispatch, formSort, designerGridFieldToSortKey]);

  // Submitter mapping and models
  const submitGridFieldToSortKey = {
    title: "formName",
    submissionsCount: "submissionCount",
    latestSubmission: "latestSubmission",
  };
  const submitSortKeyToGridField = {
    formName: "title",
    submissionCount: "submissionsCount",
    latestSubmission: "latestSubmission",
  };
  const submitActiveKey = submitFormSort?.activeKey || "formName";
  const submitActiveField = submitSortKeyToGridField[submitActiveKey] || submitActiveKey;
  const submitActiveOrder = submitFormSort?.[submitActiveKey]?.sortOrder || "asc";
  const submitSortModel = useMemo(
    () => [{ field: submitActiveField, sort: submitActiveOrder }],
    [submitActiveField, submitActiveOrder]
  );
  const submitPaginationModel = useMemo(
    () => ({ page: submitPageNo - 1, pageSize: submitLimit }),
    [submitPageNo, submitLimit]
  );
  const onSubmitPaginationModelChange = useCallback(({ page, pageSize }) => {
    batch(() => {
      if (pageSize !== submitLimit) {
        dispatch(setClientFormLimit(pageSize));
        dispatch(setClientFormListPage(1));
      } else {
        dispatch(setClientFormListPage(page + 1));
      }
    });
  }, [dispatch, submitLimit]);
  
  const handleSubmitSortModelChange = useCallback((modelArray) => {
    const model = Array.isArray(modelArray) ? modelArray[0] : modelArray;
    if (!model?.field || !model?.sort) {
      const resetSort = Object.keys(submitFormSort || {}).reduce((acc, key) => {
        acc[key] = { sortOrder: "asc" };
        return acc;
      }, {});
      dispatch(setClientFormListSort({ ...resetSort, activeKey: "formName" }));
      return;
    }
    const mappedKey = submitGridFieldToSortKey[model.field] || model.field;
    const updatedSort = Object.keys(submitFormSort || {}).reduce((acc, columnKey) => {
      acc[columnKey] = { sortOrder: columnKey === mappedKey ? model.sort : "asc" };
      return acc;
    }, {});
    dispatch(setClientFormListSort({ ...updatedSort, activeKey: mappedKey }));
  }, [dispatch, submitFormSort, submitGridFieldToSortKey]);

  const handleSubmitRefresh = useCallback(() => {
    const filters = {
      pageNo: submitPageNo,
      limit: submitLimit,
      formSort: submitFormSort,
      formName: clientSearchText,
      showForOnlyCreateSubmissionUsers: true,
      includeSubmissionsCount: true
    };
    batch(() => {
      dispatch(setBPMFormListLoading(true));
      dispatch(setFormSearchLoading(true));
      dispatch(fetchBPMFormList({ ...filters }));
    });
  }, [dispatch, submitPageNo, submitLimit, submitFormSort, clientSearchText]);
  const renderTable = () => {
    if (createDesigns || viewDesigns) {
      return <FormTable 
               isDuplicating={isDuplicating} 
               setIsDuplicating={setIsDuplicating}
               setDuplicateProgress={setDuplicateProgress}
               externalSortModel={designerSortModel}
               externalOnSortModelChange={handleDesignerSortModelChange}
               externalPaginationModel={designerPaginationModel}
               externalOnPaginationModelChange={onDesignerPaginationModelChange}
              />;
    }
    if (createSubmissions) {
      return <ClientTable
        externalSortModel={submitSortModel}
        externalOnSortModelChange={handleSubmitSortModelChange}
        externalPaginationModel={submitPaginationModel}
        externalOnPaginationModelChange={onSubmitPaginationModelChange}
        externalOnRefresh={handleSubmitRefresh}
      />;
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
                      <BreadCrumbs
                        items={[
                          { id: "forms", label: t("Forms"), href: getRoute(tenantKey).FORMFLOW },
                        ]}
                        variant="default"
                        underline={false}
                        dataTestId="listForm-breadcrumb"
                        ariaLabel={t("Form list Breadcrumb")}
                      />
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
                                  width="462px"
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
