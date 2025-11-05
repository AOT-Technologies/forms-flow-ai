import React, { useEffect, useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { connect, useSelector, useDispatch, batch } from "react-redux";
import { push } from "connected-react-router";
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
  setBpmFormSort,
  setBPMFormLimit,
  setClientFormLimit,
  setClientFormListPage,
  setClientFormListSort,
} from "../../../actions/formActions";
import {
  setFormCheckList,
  setFormSearchLoading,
} from "../../../actions/checkListActions";
import { useTranslation, Translation } from "react-i18next";
import { unPublishForm, resetFormProcessData, getApplicationCount, getProcessDetails } from "../../../apiManager/services/processServices";
import { fetchBPMFormList, fetchFormById } from "../../../apiManager/services/bpmFormServices";
import WrappedTable from "../../../components/Form/WrappedTable";
import { HelperServices } from "@formsflow/service";
import { PromptModal, V8CustomDropdownButton } from "@formsflow/components";
import { formCreate } from "../../../apiManager/services/FormServices";
import { manipulatingFormData } from "../../../apiManager/services/formFormatterService";
import _cloneDeep from "lodash/cloneDeep";
import _ from "lodash";
import userRoles from "../../../constants/permissions.js";
import {
  CustomSearch,
  V8CustomButton,
  Alert,
  AlertVariant,
  CustomProgressBar
} from "@formsflow/components";
import { navigateToDesignFormBuild, navigateToFormEntries } from "../../../helper/routerHelper.js";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";

const List = React.memo((props) => {
  const { createDesigns, createSubmissions, viewDesigns } = userRoles();
  const { t } = useTranslation();
  const searchText = useSelector((state) => state.bpmForms.searchText);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const [search, setSearch] = useState(searchText || "");
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [duplicateProgress, setDuplicateProgress] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [disableDelete, setDisableDelete] = useState(false);
  const [isAppCountLoading, setIsAppCountLoading] = useState(false);

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

  // Designer mode selectors
  const designerForms = useSelector((state) => state.bpmForms.forms) || [];
  const totalDesignerForms = useSelector((state) => state.bpmForms.totalForms) || 0;
  const designerPageNo = useSelector((state) => state.bpmForms.formListPage);
  const designerLimit = useSelector((state) => state.bpmForms.limit);
  const formSort = useSelector((state) => state.bpmForms.sort);
  
  // Submit mode selectors
  const submitForms = useSelector((state) => state.bpmForms.forms) || [];
  const totalSubmitForms = useSelector((state) => state.bpmForms.totalForms) || 0;
  const submitPageNo = useSelector((state) => state.bpmForms.submitListPage);
  const submitLimit = useSelector((state) => state.bpmForms.submitFormLimit);
  const submitFormSort = useSelector((state) => state.bpmForms.submitFormSort);
  
  const formAccess = useSelector((state) => state.user?.formAccess || []);
  const submissionAccess = useSelector((state) => state.user?.submissionAccess || []);
  const applicationCount = useSelector((state) => state.process?.applicationCount);
  const searchFormLoading = useSelector(
    (state) => state.formCheckList.searchFormLoading
  );
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  useEffect(() => {
    dispatch(setFormCheckList([]));
  }, [dispatch]);

  useEffect(() => {
    dispatch(setBPMFormListLoading(true));
  }, []);

  // Delete flow
  const deleteAction = useCallback((row) => {
    setSelectedRow(row);
    setShowDeleteModal(true);
    setIsAppCountLoading(true);
    dispatch(
      getApplicationCount(row.mapperId, () => {
        setIsAppCountLoading(false);
      })
    );
  }, [dispatch]);

  const handleDelete = useCallback(() => {
    if (!selectedRow) return;
    const formId = selectedRow._id;
    const mapperId = selectedRow.mapperId;
    if (!applicationCount || applicationCount === 0) {
      dispatch(
        deleteForm("form", formId, () => {
          dispatch(
            fetchBPMFormList({
              pageNo: designerPageNo,
              limit: designerLimit,
              formSort,
              formName: searchText,
            })
          );
        })
      );
      if (mapperId) {
        dispatch(unPublishForm(mapperId));
      }
      dispatch(setFormDeleteStatus({ modalOpen: false, formId: "", formName: "" }));
      toast.success(t("Form deleted successfully"));
    }
    handleCloseDelete();
  }, [
    dispatch,
    selectedRow,
    applicationCount,
    designerPageNo,
    designerLimit,
    formSort,
    searchText,
    t,
  ]);

  const handleCloseDelete = useCallback(() => {
    setShowDeleteModal(false);
    setSelectedRow(null);
  }, []);

  // Watch for application count updates
  useEffect(() => {
    if (selectedRow) {
      if (isAppCountLoading) {
        setDeleteMessage(t("Preparing for delete..."));
        setDisableDelete(true);
      } else if (applicationCount > 0) {
        setDeleteMessage(
          t(`This form has ${applicationCount} submission(s). You can't delete it.`)
        );
        setDisableDelete(true);
      } else {
        setDeleteMessage(t("Are you sure you want to delete this form?"));
        setDisableDelete(false);
      }
    }
  }, [applicationCount, selectedRow, isAppCountLoading, t]);

  // Duplicate flow
  const handleDuplicate = useCallback(async (row) => {
    try {
      setIsDuplicating(true);
      setDuplicateProgress(0);
      setDuplicateProgress(20);
      const formResponse = await fetchFormById(row._id);
      setDuplicateProgress(40);
      const diagramResponse = await getProcessDetails({
        processKey: row.processKey,
        tenantKey,
        mapperId: row.mapperId
      });
      setDuplicateProgress(60);
      const originalForm = formResponse.data;
      const duplicatedForm = _cloneDeep(originalForm);
      duplicatedForm.title = `${originalForm.title}-copy`;
      duplicatedForm.name = `${originalForm.name}-copy`;
      duplicatedForm.path = `${originalForm.path}-copy`;
      duplicatedForm.processData = diagramResponse.data.processData;
      duplicatedForm.processType = diagramResponse.data.processType;
      delete duplicatedForm._id;
      delete duplicatedForm.machineName;
      delete duplicatedForm.parentFormId;
      duplicatedForm.componentChanged = true;
      duplicatedForm.newVersion = true;
      setDuplicateProgress(80);
      const newFormData = manipulatingFormData(
        duplicatedForm,
        MULTITENANCY_ENABLED,
        tenantKey,
        formAccess,
        submissionAccess
      );
      setDuplicateProgress(90);
      const createResponse = await formCreate(newFormData);
      setDuplicateProgress(100);
      const createdForm = createResponse.data;
      dispatch(push(`${redirectUrl}formflow/${createdForm._id}/edit`));
    } catch (err) {
      console.error("Error duplicating form:", err);
    } finally {
      setIsDuplicating(false);
    }
  }, [tenantKey, formAccess, submissionAccess, redirectUrl, dispatch]);

  const viewOrEditForm = useCallback((formId, path) => {
    dispatch(resetFormProcessData());
    dispatch(push(`${redirectUrl}formflow/${formId}/${path}`));
  }, [dispatch, redirectUrl]);

  // Data fetching
  const fetchDesignerForms = useCallback(() => {
    dispatch(setFormSearchLoading(true));
    dispatch(
      fetchBPMFormList({
        pageNo: designerPageNo,
        limit: designerLimit,
        formSort,
        formName: searchText,
      })
    );
  }, [dispatch, designerPageNo, designerLimit, formSort, searchText]);

  const fetchSubmitForms = useCallback(() => {
    dispatch(setFormSearchLoading(true));
    dispatch(
      fetchBPMFormList({
        pageNo: submitPageNo,
        limit: submitLimit,
        formSort: submitFormSort,
        formName: searchText,
        showForOnlyCreateSubmissionUsers: true,
        includeSubmissionsCount: true,
      })
    );
  }, [dispatch, submitPageNo, submitLimit, submitFormSort, searchText]);

  useEffect(() => {
    if (createDesigns || viewDesigns) {
      fetchDesignerForms();
    }
  }, [createDesigns, viewDesigns, fetchDesignerForms]);

  useEffect(() => {
    if (createSubmissions && !(createDesigns || viewDesigns)) {
      fetchSubmitForms();
    }
  }, [createSubmissions, createDesigns, viewDesigns, fetchSubmitForms]);

  // Dropdown items for designer mode
  const getDesignerDropdownItems = useCallback((row) => {
    return [
      {
        label: t("Duplicate form"),
        onClick: () => handleDuplicate(row),
      },
      {
        label: row.status === "active" ? t("Unpublish") : t("Delete"),
        onClick: () => {
          if (row.status === "active") {
            // dispatch(unPublishForm(row.mapperId));
          } else {
            deleteAction(row);
          }
        },
        className: row.status === "active" ? "" : "delete-dropdown-item",
      },
    ];
  }, [t, handleDuplicate, deleteAction]);

  // Column definitions
  const designerGridFieldToSortKey = useMemo(() => ({
    title: "formName",
    modified: "modified",
    anonymous: "visibility",
    status: "status",
  }), []);

  const designerSortKeyToGridField = useMemo(() => ({
    formName: "title",
    modified: "modified",
    visibility: "anonymous",
    status: "status",
  }), []);

  const designerColumns = useMemo(() => {
    return [
      {
        field: "title",
        headerName: t("Name"),
        flex: 1,
        sortable: true,
        renderCell: (p) => <span title={p.value}>{p.value}</span>,
      },
      {
        field: "description",
        headerName: t("Description"),
        flex: 1,
        sortable: false,
        renderCell: (p) => {
          const text = p.row.description
            ? new DOMParser().parseFromString(p.row.description, "text/html").body.textContent
            : "";
          return <span title={text}>{text}</span>;
        },
      },
      {
        field: "modified",
        headerName: t("Last Edited"),
        flex: 1,
        sortable: true,
        renderCell: (p) => (
          <span title={HelperServices.getLocaldate(p.row.modified)}>
            {HelperServices.getLocaldate(p.row.modified)}
          </span>
        ),
      },
      {
        field: "anonymous",
        headerName: t("Visibility"),
        flex: 1,
        sortable: true,
        renderCell: (p) => (
          <span title={p.value ? t("Public") : t("Private")}>
            {p.value ? t("Public") : t("Private")}
          </span>
        ),
      },
      {
        field: "status",
        headerName: t("Status"),
        flex: 1,
        sortable: true,
        renderCell: (p) => (
          <span className="d-flex align-items-center">
            {p.value === "active" ? (
              <span className="status-live"></span>
            ) : (
              <span className="status-draft"></span>
            )}
            {p.value === "active" ? t("Live") : t("Draft")}
          </span>
        ),
      },
      {
        field: "actions",
        align: "right",
        flex: 1,
        sortable: false,
        cellClassName: "last-column",
        renderCell: (params) => {
          const rowDropdownItems = getDesignerDropdownItems(params.row);
          return (
            <V8CustomDropdownButton
              label={t("Edit")}
              variant="secondary"
              menuPosition="right"
              dropdownItems={rowDropdownItems}
              disabled={isDuplicating}
              onLabelClick={() => viewOrEditForm(params.row._id, "edit")}
            />
          );
        },
      },
    ];
  }, [t, getDesignerDropdownItems, isDuplicating, viewOrEditForm]);

  const submitGridFieldToSortKey = useMemo(() => ({
    title: "formName",
    submissionsCount: "submissionCount",
    latestSubmission: "latestSubmission",
  }), []);

  const submitSortKeyToGridField = useMemo(() => ({
    formName: "title",
    submissionCount: "submissionsCount",
    latestSubmission: "latestSubmission",
  }), []);

  const submitColumns = useMemo(() => {
    const stripHtml = (html) => {
      const doc = new DOMParser().parseFromString(html || "", "text/html");
      return doc.body.textContent || "";
    };
    return [
      {
        field: "title",
        headerName: t("Form Name"),
        flex: 1,
        sortable: true,
        renderCell: (p) => <span title={p.value}>{p.value}</span>,
      },
      {
        field: "description",
        headerName: t("Description"),
        flex: 1,
        sortable: false,
        renderCell: (p) => {
          const text = stripHtml(p.row.description);
          return <span title={text}>{text}</span>;
        },
      },
      {
        field: "submissionsCount",
        headerName: t("Submissions"),
        flex: 1,
        sortable: true,
        renderCell: (p) => <span>{p.value}</span>,
      },
      {
        field: "latestSubmission",
        headerName: t("Latest Submission"),
        flex: 1,
        sortable: true,
        renderCell: (p) => (
          <span title={HelperServices?.getLocaldate(p.row.latestSubmission)}>
            {HelperServices?.getLocaldate(p.row.latestSubmission)}
          </span>
        ),
      },
      {
        field: "actions",
        align: "right",
        flex: 1,
        sortable: false,
        cellClassName: "last-column",
        renderCell: (params) => (
          <V8CustomButton
            label={t("Select")}
            variant="secondary"
            onClick={() => navigateToFormEntries(dispatch, tenantKey, params.row.parentFormId)}
          />
        ),
      },
    ];
  }, [t, dispatch, tenantKey]);

  // Rows mapping
  const designerRows = useMemo(() => {
    return (designerForms || []).map((f) => ({ id: f._id || f.path || f.name, ...f }));
  }, [designerForms]);

  const submitRows = useMemo(() => {
    return (submitForms || []).map((f) => ({ id: f._id, ...f }));
  }, [submitForms]);

  // Sort models
  const designerActiveKey = formSort?.activeKey || "formName";
  const designerActiveField = designerSortKeyToGridField[designerActiveKey] || designerActiveKey;
  const designerActiveOrder = formSort?.[designerActiveKey]?.sortOrder || "asc";
  const designerSortModel = useMemo(
    () => [{ field: designerActiveField, sort: designerActiveOrder }],
    [designerActiveField, designerActiveOrder]
  );

  const submitActiveKey = submitFormSort?.activeKey || "formName";
  const submitActiveField = submitSortKeyToGridField[submitActiveKey] || submitActiveKey;
  const submitActiveOrder = submitFormSort?.[submitActiveKey]?.sortOrder || "asc";
  const submitSortModel = useMemo(
    () => [{ field: submitActiveField, sort: submitActiveOrder }],
    [submitActiveField, submitActiveOrder]
  );

  // Sort handlers
  const handleDesignerSortModelChange = useCallback((modelArray) => {
    const model = Array.isArray(modelArray) ? modelArray[0] : modelArray;
    if (!model?.field || !model?.sort) {
      const resetSort = Object.keys(formSort || {}).reduce((acc, key) => { acc[key] = { sortOrder: "asc" }; return acc; }, {});
      dispatch(setBpmFormSort({ ...resetSort, activeKey: "formName" }));
      return;
    }
    const incomingField = model.field;
    const incomingOrder = model.sort;
    const mappedKey = designerGridFieldToSortKey[incomingField] || incomingField;
    const updatedSort = Object.keys(formSort || {}).reduce((acc, columnKey) => {
      acc[columnKey] = { sortOrder: columnKey === mappedKey ? incomingOrder : "asc" };
      return acc;
    }, {});
    dispatch(setBpmFormSort({ ...updatedSort, activeKey: mappedKey }));
  }, [dispatch, formSort, designerGridFieldToSortKey]);

  const handleSubmitSortModelChange = useCallback((modelArray) => {
    const model = Array.isArray(modelArray) ? modelArray[0] : modelArray;
    if (!model?.field || !model?.sort) {
      const resetSort = Object.keys(submitFormSort || {}).reduce((acc, key) => { acc[key] = { sortOrder: "asc" }; return acc; }, {});
      dispatch(setClientFormListSort({ ...resetSort, activeKey: "formName" }));
      return;
    }
    const incomingField = model.field;
    const incomingOrder = model.sort;
    const mappedKey = submitGridFieldToSortKey[incomingField] || incomingField;
    const updatedSort = Object.keys(submitFormSort || {}).reduce((acc, columnKey) => {
      acc[columnKey] = { sortOrder: columnKey === mappedKey ? incomingOrder : "asc" };
      return acc;
    }, {});
    dispatch(setClientFormListSort({ ...updatedSort, activeKey: mappedKey }));
  }, [dispatch, submitFormSort, submitGridFieldToSortKey]);

  // Pagination models
  const designerPaginationModel = useMemo(
    () => ({ page: designerPageNo - 1, pageSize: designerLimit }),
    [designerPageNo, designerLimit]
  );
  const submitPaginationModel = useMemo(
    () => ({ page: submitPageNo - 1, pageSize: submitLimit }),
    [submitPageNo, submitLimit]
  );

  // Pagination handlers
  const onDesignerPaginationModelChange = useCallback(({ page, pageSize }) => {
    const requestedPage = typeof page === "number" ? page + 1 : designerPageNo;
    const requestedLimit = typeof pageSize === "number" ? pageSize : designerLimit;
    if (requestedPage === designerPageNo && requestedLimit === designerLimit) return;
    batch(() => {
      if (requestedLimit !== designerLimit) {
        dispatch(setBPMFormLimit(requestedLimit));
        dispatch(setBPMFormListPage(1));
      } else if (requestedPage !== designerPageNo) {
        dispatch(setBPMFormListPage(requestedPage));
      }
    });
  }, [dispatch, designerPageNo, designerLimit]);

  const onSubmitPaginationModelChange = useCallback(({ page, pageSize }) => {
    const requestedPage = typeof page === "number" ? page + 1 : submitPageNo;
    const requestedLimit = typeof pageSize === "number" ? pageSize : submitLimit;
    if (requestedPage === submitPageNo && requestedLimit === submitLimit) return;
    batch(() => {
      if (requestedLimit !== submitLimit) {
        dispatch(setClientFormLimit(requestedLimit));
        dispatch(setClientFormListPage(1));
      } else if (requestedPage !== submitPageNo) {
        dispatch(setClientFormListPage(requestedPage));
      }
    });
  }, [dispatch, submitPageNo, submitLimit]);

  const renderTable = () => {
    if (createDesigns || viewDesigns) {
      return (
        <WrappedTable
          columns={designerColumns}
          rows={designerRows}
          rowCount={totalDesignerForms}
          loading={searchFormLoading}
          sortModel={designerSortModel}
          onSortModelChange={handleDesignerSortModelChange}
          paginationModel={designerPaginationModel}
          onPaginationModelChange={onDesignerPaginationModelChange}
          getRowId={(row) => row.id}
          onRefresh={fetchDesignerForms}
        />
      );
    }
    if (createSubmissions) {
      return (
        <WrappedTable
          columns={submitColumns}
          rows={submitRows}
          rowCount={totalSubmitForms}
          loading={searchFormLoading}
          sortModel={submitSortModel}
          onSortModelChange={handleSubmitSortModelChange}
          paginationModel={submitPaginationModel}
          onPaginationModelChange={onSubmitPaginationModelChange}
          getRowId={(row) => row.id}
          onRefresh={fetchSubmitForms}
        />
      );
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
                                  width="462px"
                                />
                    </div>
                 </div>

                 <div className="body-section">
                    {renderTable()}
                 </div>
        </>
      )}
      <PromptModal
        show={showDeleteModal}
        onClose={handleCloseDelete}
        title={t("Delete Item")}
        message={deleteMessage}
        type="warning"
        primaryBtnText={t("Delete")}
        primaryBtnAction={handleDelete}
        primaryBtnDisable={disableDelete}
        secondaryBtnText={t("Cancel")}
        secondaryBtnAction={handleCloseDelete}
      />
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
