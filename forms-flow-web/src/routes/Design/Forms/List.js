import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect, useSelector, useDispatch } from "react-redux";
import CreateFormModal from "../../../components/Modals/CreateFormModal.js";
import { toast } from "react-toastify";
import { addTenantkey } from "../../../helper/helper";
import {
  selectRoot,
  deleteForm,
} from "@aot-technologies/formio-react";
import Loading from "../../../containers/Loading";
import { MULTITENANCY_ENABLED, MAX_FILE_SIZE } from "../../../constants/constants";
import {
  setBPMFormListLoading,
  setFormDeleteStatus,
  setBpmFormSearch,
  setBPMFormListPage,
  setBPMFormLimit,
  setBpmFormSort,
  setFormSuccessData
} from "../../../actions/formActions";
import { fetchBPMFormList } from "../../../apiManager/services/bpmFormServices";
import {
  setFormCheckList,
  setFormSearchLoading,
} from "../../../actions/checkListActions";
import { useTranslation, Translation } from "react-i18next";
import { unPublishForm } from "../../../apiManager/services/processServices";
// FormTable removed; using DataGrid for both designer and submit tables
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { RefreshIcon } from "@formsflow/components";
import { HelperServices } from "@formsflow/service";
import { batch } from "react-redux";
import { setClientFormLimit, setClientFormListPage, setClientFormListSort } from "../../../actions/formActions";
import _ from "lodash";
import _camelCase from "lodash/camelCase";
import {
  formCreate,
  formImport,
  validateFormName,
} from "../../../apiManager/services/FormServices";
import userRoles from "../../../constants/permissions.js";
import FileService from "../../../services/FileService";
import {
  FormBuilderModal,
  ImportModal,
  CustomSearch,
  CustomButton,
  useSuccessCountdown,
  V8CustomButton,
  Alert,
  AlertVariant,
  CustomProgressBar
} from "@formsflow/components";
import { useMutation } from "react-query";
import { addHiddenApplicationComponent } from "../../../constants/applicationComponent";
import { navigateToDesignFormEdit, navigateToDesignFormBuild } from "../../../helper/routerHelper.js";
import FilterSortActions from "../../../components/CustomComponents/FilterSortActions.js";

const List = React.memo((props) => {
  const { createDesigns, createSubmissions, viewDesigns } = userRoles();
  const { t } = useTranslation();
  const searchText = useSelector((state) => state.bpmForms.searchText);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const [search, setSearch] = useState(searchText || "");
  const [showBuildForm, setShowBuildForm] = useState(false);
  const [importFormModal, setImportFormModal] = useState(false);
  const [importError, setImportError] = useState("");
  const [importLoader, setImportLoader] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const { successState, startSuccessCountdown } = useSuccessCountdown();
  const [isDuplicating] = useState(false);
  const [duplicateProgress] = useState(0);


  const handleFilterIconClick = () => {
    setShowSortModal(true); // Open the SortModal
  };

  const handleSortModalClose = () => {
    setShowSortModal(false); // Close the SortModal
  };

  const handleSortApply = (selectedSortOption, selectedSortOrder) => {
    
    const resetSortOrders = HelperServices.getResetSortOrders(optionSortBy);
    dispatch(
      setBpmFormSort({
        ...resetSortOrders,
        activeKey: selectedSortOption,
        [selectedSortOption]: { sortOrder: selectedSortOrder },
      })
    );
    setShowSortModal(false);
  };

  const ActionType = {
    BUILD: "BUILD",
    IMPORT: "IMPORT",
  };

  const UploadActionType = {
    IMPORT: "import",
    VALIDATE: "validate",
  };

  const [nameError, setNameError] = useState("");
  const dispatch = useDispatch();
  const submissionAccess = useSelector(
    (state) => state.user?.submissionAccess || []
  );

  const [formSubmitted, setFormSubmitted] = useState(false);

  /* --------- validate form title exist or not --------- */
  const {
    mutate: validateFormTitle, // this function will trigger the API call
    isLoading: validationLoading,
    // isError: error,
  } = useMutation(({ title }) => validateFormName(title), {
    onSuccess: ({ data }, { createButtonClicked, ...variables }) => {
      if (data && data.code === "FORM_EXISTS") {
        setNameError(data.message); // Set exact error message
      } else {
        setNameError("");
        // if the modal clicked createButton, need to call handleBuild
        if (createButtonClicked) {
          handleBuild(variables);
        }
      }
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        "An error occurred while validating the form name.";
      setNameError(errorMessage); // Set the error message from the server
    },
  });

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
  // Submit (client) listing state
  const submitPageNo = useSelector((state) => state.bpmForms.submitListPage);
  const submitLimit = useSelector((state) => state.bpmForms.submitFormLimit);
  const submitFormSort = useSelector((state) => state.bpmForms.submitFormSort);
  const clientSearchText = useSelector((state) => state.bpmForms.clientFormSearch);
  const totalClientForms = useSelector((state) => state.bpmForms.totalForms) || 0;
  const clientForms = useSelector((state) => state.bpmForms.forms) || [];
  const totalDesignerForms = useSelector((state) => state.bpmForms.totalForms) || 0;
  const designerForms = useSelector((state) => state.bpmForms.forms) || [];
  const formAccess = useSelector((state) => state.user?.formAccess || []);
  const searchFormLoading = useSelector(
    (state) => state.formCheckList.searchFormLoading
  );
  const [newFormModal, setNewFormModal] = useState(false);
  const [description, setDescription] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const  optionSortBy = [
    { value: "formName", label: t("Form Name") },
    { value: "visibility", label: t("Visibility") },
    { value: "status", label: t("Status") },
    { value: "modified", label: t("Last Edited") },
  ];
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
  const fetchClientForms = () => {
    dispatch(setFormSearchLoading(true));
    dispatch(fetchBPMFormList({
      pageNo: submitPageNo,
      limit: submitLimit,
      formSort: submitFormSort,
      formName: clientSearchText,
      showForOnlyCreateSubmissionUsers: true,
      includeSubmissionsCount: true
    }));
  };
  const onClose = () => {
    setNewFormModal(false);
  };
  const onCloseimportModal = () => {
    setImportError("");
    setImportFormModal(false);
  };
  const onCloseBuildModal = () => {
    setShowBuildForm(false);
    setNameError("");
    setFormSubmitted(false);
  };
  const handleAction = (actionType) => {
    switch (actionType) {
      case ActionType.BUILD:
        setShowBuildForm(true);
        break;
      case ActionType.IMPORT:
        setImportFormModal(true);
        break;
    }
    onClose();
  };

  const handleImport = async (fileContent, actionType) => {

    if (fileContent.size > MAX_FILE_SIZE) {
      setImportError(
        `File size exceeds the ${
          MAX_FILE_SIZE / (1024 * 1024)
        }MB limit. Please upload a smaller file.`
      );
      return;
    }

    let data;
    if (
      [UploadActionType.VALIDATE, UploadActionType.IMPORT].includes(actionType)
    ) {
      data = { importType: "new", action: actionType };
    } else {
      console.error("Invalid UploadActionType provided");
      return;
    }

    if (actionType === UploadActionType.IMPORT) {
      setImportLoader(true);
      setFormSubmitted(true);
    }

    try {
      const dataString = JSON.stringify(data);
      const res = await formImport(fileContent, dataString);
      const { data: responseData } = res;
      const formId = responseData.mapper?.formId;

      setImportLoader(false);
      setFormSubmitted(false);

      if (actionType === UploadActionType.VALIDATE) {
        const formExtracted = await FileService.extractFileDetails(fileContent);

        if (Array.isArray(formExtracted?.forms)) {
          setFormTitle(formExtracted?.forms[0]?.formTitle || "");
          setDescription(
            formExtracted?.forms[0]?.formDescription || ""
          );
        }
      } else if (formId) {
        navigateToDesignFormEdit(dispatch, tenantKey, formId);
      }
    } catch (err) {
      setImportLoader(false);
      setFormSubmitted(false);
      setImportError(err?.response?.data?.message);
    }
  };

  // Fetch designer list for DataGrid when designer/view tables are shown
  useEffect(() => {
    if (createDesigns || viewDesigns) {
      fetchForms();
    }
  }, [createDesigns, viewDesigns, pageNo, limit, formSort, searchText]);

  // Fetch for client listing when viewing submissions-only table
  useEffect(() => {
    if (createSubmissions && !createDesigns && !viewDesigns) {
      fetchClientForms();
    }
  }, [
    createSubmissions,
    createDesigns,
    viewDesigns,
    submitPageNo,
    submitLimit,
    submitFormSort,
    clientSearchText,
  ]);

  const validateForm = ({ title }) => {
    if (!title || title.trim() === "") {
      return "This field is required";
    }
    return null;
  };

  const validateFormNameOnBlur = ({ title, ...rest }) => {
    //the reset variable contain title, description, display  also sign for clicked in create button
    const error = validateForm({ title });

    if (error) {
      setNameError(error);
      return;
    }
    validateFormTitle({ title, ...rest });
  };

  const handleBuild = ({ description, display, title }) => {
    setFormSubmitted(true);
    const error = validateForm({ title });
    if (error) {
      setNameError(error);
      return;
    }
    const name = _camelCase(title);
    const newForm = {
      display,
      tags: ["common"],
      submissionAccess: submissionAccess,
      componentChanged: true,
      newVersion: true,
      components: [],
      access: formAccess,
      title,
      name,
      description,
      path: name.toLowerCase(),
    };
    newForm.components = addHiddenApplicationComponent(newForm).components;

    if (MULTITENANCY_ENABLED && tenantKey) {
      newForm.tenantKey = tenantKey;
      newForm.path = addTenantkey(newForm.path, tenantKey);
      newForm.name = addTenantkey(newForm.name, tenantKey);
    }
    formCreate(newForm)
      .then((res) => {
        const form = res.data;
        dispatch(setFormSuccessData("form", form));
        startSuccessCountdown(() => {
          navigateToDesignFormEdit(dispatch, tenantKey, form._id);
        },2);
      })
      .catch((err) => {
        let error;
        if (err.response?.data) {
          error = err.response.data;
          console.log(error);
          setNameError(error?.errors?.name?.message);
        } else {
          error = err.message;
          setNameError(error?.errors?.name?.message);
        }
      })
      .finally(() => {
        setFormSubmitted(false);
      });
  };

  const handleRefresh = () => {
  fetchForms();
  };
  const renderTable = () => {
    console.log("createDesigns", createDesigns);
    console.log("viewDesigns", viewDesigns);
    console.log("createSubmissions", createSubmissions);  
    if (createDesigns || viewDesigns) {
      // Designer DataGrid columns (similar to FormTable)
      const gridFieldToSortKeyDesigner = {
        title: "formName",
        modified: "modified",
        anonymous: "visibility",
        status: "status",
      };
      const sortKeyToGridFieldDesigner = {
        formName: "title",
        modified: "modified",
        visibility: "anonymous",
        status: "status",
      };
      const designerColumns = [
        { field: "title", headerName: t("Name"), flex: 1, sortable: true },
        {
          field: "description",
          headerName: t("Description"),
          flex: 1,
          sortable: false,
          renderCell: (params) => {
            const text = params.row.description
              ? new DOMParser().parseFromString(params.row.description, "text/html").body
                  .textContent
              : "";
            return <span title={text}>{text}</span>;
          },
        },
        {
          field: "modified",
          headerName: t("Last Edited"),
          flex: 1,
          sortable: true,
          renderCell: (params) => (
            <span title={HelperServices.getLocaldate(params.row.modified)}>
              {HelperServices.getLocaldate(params.row.modified)}
            </span>
          ),
        },
        {
          field: "anonymous",
          headerName: t("Visibility"),
          flex: 1,
          sortable: true,
          renderCell: (params) => (
            <span title={params.value ? t("Public") : t("Private")}>
              {params.value ? t("Public") : t("Private")}
            </span>
          ),
        },
        {
          field: "status",
          headerName: t("Status"),
          flex: 1,
          sortable: true,
          renderCell: (params) => (
            <span className="d-flex align-items-center">
              {params.value === "active" ? (
                <span className="status-live"></span>
              ) : (
                <span className="status-draft"></span>
              )}
              {params.value === "active" ? t("Live") : t("Draft")}
            </span>
          ),
        },
        {
          field: "actions",
          align: "right",
          renderHeader: () => (
            <V8CustomButton
              variant="secondary"
              icon={<RefreshIcon />}
              iconOnly
              onClick={handleRefresh}
            />
          ),
          flex: 1,
          sortable: false,
          cellClassName: "last-column",
        },
      ];

      const designerRows = React.useMemo(() => {
        return (designerForms || []).map((f) => ({
          id: f._id || f.path || f.name,
          ...f,
        }));
      }, [designerForms]);

      const designerActiveKey = formSort?.activeKey || "formName";
      const designerActiveField =
        sortKeyToGridFieldDesigner[designerActiveKey] || designerActiveKey;
      const designerActiveOrder = formSort?.[designerActiveKey]?.sortOrder || "asc";
      const designerSortModel = React.useMemo(
        () => [{ field: designerActiveField, sort: designerActiveOrder }],
        [designerActiveField, designerActiveOrder]
      );
      const handleDesignerSortModelChange = (modelArray) => {
        const model = Array.isArray(modelArray) ? modelArray[0] : modelArray;
        if (!model?.field || !model?.sort) {
          const resetSort = Object.keys(formSort || {}).reduce((acc, key) => {
            acc[key] = { sortOrder: "asc" };
            return acc;
          }, {});
          dispatch(setBpmFormSort({ ...resetSort, activeKey: "formName" }));
          dispatch(setBPMFormListPage(1));
          return;
        }
        const incomingField = model.field;
        const incomingOrder = model.sort;
        const currentField =
          sortKeyToGridFieldDesigner[formSort?.activeKey || "formName"] ||
          formSort?.activeKey ||
          "formName";
        const currentOrder = formSort?.[formSort?.activeKey || "formName"]?.sortOrder || "asc";
        if (incomingField === currentField && incomingOrder === currentOrder) return;
        const mappedKey = gridFieldToSortKeyDesigner[incomingField] || incomingField;
        const updatedSort = Object.keys(formSort || {}).reduce((acc, columnKey) => {
          acc[columnKey] = { sortOrder: columnKey === mappedKey ? incomingOrder : "asc" };
          return acc;
        }, {});
        dispatch(setBpmFormSort({ ...updatedSort, activeKey: mappedKey }));
      };
      const designerPaginationModel = React.useMemo(
        () => ({ page: pageNo - 1, pageSize: limit }),
        [pageNo, limit]
      );
      const onDesignerPaginationModelChange = ({ page, pageSize }) => {
        const requestedPage = typeof page === "number" ? page + 1 : pageNo;
        const requestedLimit = typeof pageSize === "number" ? pageSize : limit;
        if (requestedPage === pageNo && requestedLimit === limit) return;
        if (requestedLimit !== limit) {
          dispatch(setBPMFormLimit(requestedLimit));
          dispatch(setBPMFormListPage(1));
        } else if (requestedPage !== pageNo) {
          dispatch(setBPMFormListPage(requestedPage));
        }
      };

      return (
        <Paper sx={{ height: { sm: 400, md: 510, lg: 665 }, width: "100%" }}>
          <DataGrid
            columns={designerColumns}
            rows={designerRows}
            rowCount={totalDesignerForms}
            loading={searchFormLoading}
            paginationMode="server"
            sortingMode="server"
            sortModel={designerSortModel}
            onSortModelChange={handleDesignerSortModelChange}
            paginationModel={designerPaginationModel}
            onPaginationModelChange={onDesignerPaginationModelChange}
            getRowId={(row) => row.id}
            pageSizeOptions={[10, 25, 50, 100]}
            rowHeight={55}
            disableColumnMenu
            disableRowSelectionOnClick
          />
        </Paper>
      );
    }
    if (createSubmissions) {
      // Columns mirroring SubmitList.js
      const gridFieldToSortKey = {
        title: "formName",
        submissionsCount: "submissionCount",
        latestSubmission: "latestSubmission",
      };
      const sortKeyToGridField = {
        formName: "title",
        submissionCount: "submissionsCount",
        latestSubmission: "latestSubmission",
      };
      const stripHtml = (html) => {
        const doc = new DOMParser().parseFromString(html || "", "text/html");
        return doc.body.textContent || "";
      };
      const columns = [
        {
          field: "title",
          headerName: t("Form Name"),
          flex: 1,
          sortable: true,
          renderCell: (params) => (
            <span title={params.value}>{params.value}</span>
          ),
        },
        {
          field: "description",
          headerName: t("Description"),
          flex: 1,
          sortable: false,
          renderCell: (params) => {
            const text = stripHtml(params.row.description);
            return <span title={text}>{text}</span>;
          },
        },
        {
          field: "submissionsCount",
          headerName: t("Submissions"),
          flex: 1,
          sortable: true,
          renderCell: (params) => <span>{params.value}</span>,
        },
        {
          field: "latestSubmission",
          headerName: t("Latest Submission"),
          flex: 1,
          sortable: true,
          renderCell: (params) => (
            <span title={HelperServices?.getLocaldate(params.row.latestSubmission)}>
              {HelperServices?.getLocaldate(params.row.latestSubmission)}
            </span>
          ),
        },
        {
          field: "actions",
          align: "right",
          renderHeader: () => (
            <V8CustomButton
              variant="secondary"
              icon={<RefreshIcon />}
              iconOnly
              onClick={fetchClientForms}
            />
          ),
          flex: 1,
          sortable: false,
          cellClassName: "last-column",
        },
      ];
      const clientRows = React.useMemo(() => {
        return (clientForms || []).map((f) => ({
          id: f._id,
          title: f.title,
          description: f.description,
          submissionsCount: f.submissionsCount,
          latestSubmission: f.latestSubmission,
        }));
      }, [clientForms]);
      const activeKey = submitFormSort?.activeKey || "formName";
      const activeField = sortKeyToGridField[activeKey] || activeKey;
      const activeOrder = submitFormSort?.[activeKey]?.sortOrder || "asc";
      const sortModel = React.useMemo(
        () => [{ field: activeField, sort: activeOrder }],
        [activeField, activeOrder]
      );
      const handleClientSortModelChange = (modelArray) => {
        const model = Array.isArray(modelArray) ? modelArray[0] : modelArray;
        if (!model?.field || !model?.sort) {
          const isAlreadyDefault =
            (submitFormSort?.activeKey || "formName") === "formName" &&
            (submitFormSort?.formName?.sortOrder || "asc") === "asc";
          if (!isAlreadyDefault) {
            const resetSort = Object.keys(submitFormSort || {}).reduce((acc, key) => {
              acc[key] = { sortOrder: "asc" };
              return acc;
            }, {});
            dispatch(setClientFormListSort({ ...resetSort, activeKey: "formName" }));
          }
          return;
        }
        const incomingField = model.field;
        const incomingOrder = model.sort;
        const currentActiveKey = submitFormSort?.activeKey || "formName";
        const currentField = sortKeyToGridField[currentActiveKey] || currentActiveKey;
        const currentOrder = submitFormSort?.[currentActiveKey]?.sortOrder || "asc";
        if (incomingField === currentField && incomingOrder === currentOrder) return;
        const mappedKey = gridFieldToSortKey[incomingField] || incomingField;
        const updatedSort = Object.keys(submitFormSort || {}).reduce((acc, columnKey) => {
          acc[columnKey] = { sortOrder: columnKey === mappedKey ? incomingOrder : "asc" };
          return acc;
        }, {});
        dispatch(setClientFormListSort({ ...updatedSort, activeKey: mappedKey }));
      };
      const paginationModel = React.useMemo(
        () => ({ page: submitPageNo - 1, pageSize: submitLimit }),
        [submitPageNo, submitLimit]
      );
      const onClientPaginationModelChange = ({ page, pageSize }) => {
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
      };
      return (
        <Paper sx={{ height: { sm: 400, md: 510, lg: 665 }, width: "100%" }}>
          <DataGrid
            columns={columns}
            rows={clientRows}
            rowCount={totalClientForms}
            loading={searchFormLoading}
            paginationMode="server"
            sortingMode="server"
            sortModel={sortModel}
            onSortModelChange={handleClientSortModelChange}
            paginationModel={paginationModel}
            onPaginationModelChange={onClientPaginationModelChange}
            getRowId={(row) => row.id}
            pageSizeOptions={[10, 25, 50, 100]}
            rowHeight={55}
            disableColumnMenu
            disableRowSelectionOnClick
          />
        </Paper>
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
                                  width="22rem"
                                />
                    </div>
                 </div>

                 <div className="body-section">
                    {renderTable()}
                 </div>


        
          {(
              <div className="table-bar">
                <div className="filters">
                </div>
                {/* hiding for the time being. */}
                <div className="actions" style={{display:"none"}}>
                  <FilterSortActions
                    showSortModal={showSortModal}
                    handleFilterIconClick={handleFilterIconClick}
                    handleRefresh={handleRefresh}
                    handleSortModalClose={handleSortModalClose}
                    handleSortApply={handleSortApply}
                    optionSortBy={optionSortBy}
                    defaultSortOption={formSort.activeKey}
                    defaultSortOrder={formSort[formSort.activeKey]?.sortOrder || "asc"}
                    filterDataTestId="form-list-filter"
                    filterAriaLabel="Filter the form list"
                    refreshDataTestId="form-list-refresh"
                    refreshAriaLabel="Refresh the form list"
                  /> 

                  {createDesigns && (
                    <CustomButton
                      label={t("New Form & Flow")}
                      onClick={() => setNewFormModal(true)}
                      dataTestId="create-form-button"
                      ariaLabel="Create Form"
                      action
                    />
                  )}
                  <CreateFormModal
                    newFormModal={newFormModal}
                    actionType={ActionType}
                    onClose={onClose}
                    onAction={handleAction}
                  />
                  <FormBuilderModal
                    modalHeader={t("Build New Form")}
                    nameLabel={t("Form Name")}
                    descriptionLabel={t("Form Description")}
                    showBuildForm={showBuildForm}
                    isSaveBtnLoading={formSubmitted}
                    isFormNameValidating={validationLoading}
                    onClose={onCloseBuildModal}
                    onAction={handleAction}
                    primaryBtnAction={handleBuild}
                    setNameError={setNameError}
                    nameValidationOnBlur={validateFormNameOnBlur}
                    nameError={nameError}
                    buildForm={true}
                    showSuccess={successState?.showSuccess} // ✅ Pass success state
                    successCountdown={successState?.countdown} // ✅ Pass countdown
                  />
                  {importFormModal && (
                    <ImportModal
                      importLoader={importLoader}
                      importError={importError}
                      showModal={importFormModal}
                      uploadActionType={UploadActionType}
                      formName={formTitle}
                      formSubmitted={formSubmitted}
                      description={description}
                      onClose={onCloseimportModal}
                      handleImport={handleImport}
                      headerText={t("Import New Form")}
                      primaryButtonText={t("Confirm and Edit Form")}
                      fileType=".json"
                    />
                  )}
                </div>
              </div>
          )}
         {/* {renderTable()} */}
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
