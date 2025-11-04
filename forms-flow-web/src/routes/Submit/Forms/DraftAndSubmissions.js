import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSelector, useDispatch, batch } from "react-redux";
import PropTypes from "prop-types";
// import { Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { fetchApplicationsAndDrafts } from "../../../apiManager/services/applicationServices";
import userRoles from "../../../constants/permissions";
import {
  setApplicationListActivePage,
  setApplicationListSearchParams,
  setApplicationLoading,
  setCountPerpage,
  setFormSubmissionSort,
} from "../../../actions/applicationActions";
import { navigateToNewSubmission, navigateToSubmitFormsListing } from "../../../helper/routerHelper";
import { CustomSearch, BreadCrumbs, V8CustomButton, PromptModal } from "@formsflow/components";
import WrappedTable from "../../../components/Form/WrappedTable";
import { HelperServices } from "@formsflow/service";
import { CLIENT_EDIT_STATUS } from "../../../constants/applicationConstants";
import { deleteDraftbyId } from "../../../apiManager/services/draftService";
import { toast } from "react-toastify";
import { navigateToDraftEdit, navigateToViewSubmission, navigateToResubmit } from "../../../helper/routerHelper";
import { useParams } from "react-router-dom";

// SearchBar Component
const SearchBar = ({ search, setSearch, handleSearch, handleClearSearch, searchLoading }) => {
  const { t } = useTranslation();

  return (
    <div className="application-search-box">
      <CustomSearch
        search={search}
        setSearch={setSearch}
        handleSearch={handleSearch}
        handleClearSearch={handleClearSearch}
        placeholder={t("Search by ID")}
        searchLoading={searchLoading}
        title={t("Search Form Name and Description")}
        dataTestId="form-search-input"
        width="22rem"
      />
    </div>
  );
};

SearchBar.propTypes = {
  search: PropTypes.string.isRequired,
  setSearch: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  handleClearSearch: PropTypes.func.isRequired,
  searchLoading: PropTypes.bool.isRequired,
};

// Main Component
const DraftsAndSubmissions = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { parentFormId } = useParams();
  const formId = useSelector(
    (state) => state.applications.draftAndSubmissionsList?.formId
  );
  
  // Redux state selectors
  const tenantId = useSelector((state) => state.tenants?.tenantId);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const searchFormLoading = useSelector((state) => state.formCheckList.searchFormLoading);
  const {createSubmissions} = userRoles();
  const {    
    formName,
    activePage: pageNo,
    countPerPage: limit,
    sort: applicationSort
  } = useSelector((state) => state.applications);
  const draftAndSubmissionsList = useSelector(
    (state) => state.applications.draftAndSubmissionsList
  );
  const isApplicationLoading = useSelector((state) => state.applications.isApplicationLoading);
  const totalForms = useSelector((state) => state.applications.applicationCount);

  const canEdit = createSubmissions;

  // Local state
  const [search, setSearch] = useState("");
    
  useEffect(() => {
    if (!search?.trim()) {
      dispatch(setApplicationListSearchParams(""));
    }
  }, [search]);

  const handleSearch = () => {
    dispatch(setApplicationListActivePage(1));
  };

  const handleClearSearch = () => setSearch("");

  const lastQueryRef = useRef("");

  const fetchSubmissionsAndDrafts = useCallback(() => {
    const activeKey = applicationSort?.activeKey;
    const sortOrder = applicationSort?.[activeKey]?.sortOrder;
    const queryKey = JSON.stringify({
      pageNo,
      limit,
      activeKey,
      sortOrder,
      parentFormId,
      search,
    });
    if (lastQueryRef.current === queryKey) return;
    lastQueryRef.current = queryKey;
    dispatch(setApplicationLoading(true));
    dispatch(
      fetchApplicationsAndDrafts({
        pageNo,
        limit,
        applicationSort,
        parentFormId,
        search,
        createdUserSubmissions: true,
        includeDrafts: true,
      })
    );
  }, [dispatch, pageNo, limit, applicationSort, parentFormId, search]);
 
  const submitNewForm = () => {
    navigateToNewSubmission(dispatch, tenantKey, formId);
  };

  const redirectBackToForm = () => {
    navigateToSubmitFormsListing(dispatch, tenantId);
  };

  // Fetch data when dependencies change
  useEffect(() => {
    fetchSubmissionsAndDrafts();
  }, [fetchSubmissionsAndDrafts]);

  // Sorting
  const gridFieldToSortKey = useMemo(() => ({
    id: "id",
    created: "created",
    modified: "modified",
    isDraft: "type",
    applicationStatus: "applicationStatus",
  }), []);

  const sortKeyToGridField = useMemo(() => ({
    id: "id",
    created: "created",
    modified: "modified",
    type: "isDraft",
    applicationStatus: "applicationStatus",
  }), []);

  const handleSortModelChange = useCallback((modelArray) => {
    const model = Array.isArray(modelArray) ? modelArray[0] : modelArray;
    if (!model?.field || !model?.sort) {
      const resetSort = Object.keys(applicationSort).reduce((acc, key) => {
        acc[key] = { sortOrder: "asc" };
        return acc;
      }, {});
      dispatch(setFormSubmissionSort({ ...resetSort, activeKey: "id" }));
      return;
    }
    const mappedKey = gridFieldToSortKey[model.field] || model.field;
    const order = model.sort;
    const updatedSort = Object.keys(applicationSort).reduce((acc, columnKey) => {
      acc[columnKey] = { sortOrder: columnKey === mappedKey ? order : "asc" };
      return acc;
    }, {});
    dispatch(setFormSubmissionSort({ ...updatedSort, activeKey: mappedKey }));
  }, [dispatch, applicationSort, gridFieldToSortKey]);

  const continueResubmit = (row) => {
    navigateToResubmit(dispatch, tenantKey, row.formId, row.submissionId);
  };

  const continueDraft = (row) => {
    navigateToDraftEdit(dispatch, tenantKey, row.formId, row.id);
  };

  const viewSubmission = (item) => {
    navigateToViewSubmission(dispatch, tenantKey, item.formId, item.id);
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteDraftId, setDeleteDraftId] = useState("");
  const [isDeletionLoading, setIsDeletionLoading] = useState(false);

  const deleteDraft = (row) => {
    setDeleteDraftId(row.id);
    setShowDeleteModal(true);
  };

  const handleCloseActionModal = () => {
    setDeleteDraftId("");
    setShowDeleteModal(false);
  };

  const confirmDraftDelete = () => {
    setIsDeletionLoading(true);
    deleteDraftbyId(deleteDraftId)
      .then(() => {
        toast.success(t("Draft Deleted Successfully"));
        fetchSubmissionsAndDrafts();
      })
      .catch((error) => {
        toast.error(error.message);
      })
      .finally(() => {
        setIsDeletionLoading(false);
        setShowDeleteModal(false);
      });
  };

  const rows = useMemo(
    () => draftAndSubmissionsList?.applications || [],
    [draftAndSubmissionsList]
  );
  const paginationModel = useMemo(
    () => ({ page: pageNo - 1, pageSize: limit }),
    [pageNo, limit]
  );

  const activeKey = applicationSort?.activeKey || "id";
  const activeField = sortKeyToGridField[activeKey] || activeKey;
  const activeOrder = applicationSort?.[activeKey]?.sortOrder || "asc";
  const sortModel = useMemo(
    () => [{ field: activeField, sort: activeOrder }],
    [activeField, activeOrder]
  );

  const onPaginationModelChange = ({ page, pageSize }) => {
    const nextPage = typeof page === "number" ? page + 1 : pageNo;
    const nextLimit = typeof pageSize === "number" ? pageSize : limit;
    if (nextPage === pageNo && nextLimit === limit) return;
    batch(() => {
      if (nextLimit !== limit) {
        dispatch(setCountPerpage(nextLimit));
        dispatch(setApplicationListActivePage(1));
      } else if (nextPage !== pageNo) {
        dispatch(setApplicationListActivePage(nextPage));
      }
    });
  };
  
  const breadcrumbItems = [
    { id: "submit", label: t("Submit")},
    { label: formName || ""}
  ];

  const handleBreadcrumbClick = (item) => {
  if (item.id === "submit") {
    redirectBackToForm();
  }
  };

  return (
    <>
      <div className="header-section-1">
          <div className="section-seperation-left">
            <BreadCrumbs 
              items={breadcrumbItems} 
              onBreadcrumbClick={handleBreadcrumbClick}
            /> 
          </div>
          <div className="section-seperation-right">
            {createSubmissions && 
            <V8CustomButton
              variant="primary"
              label={t("Create new submission")}
              onClick={submitNewForm}
            />} 
          </div>
      </div>

            <div className="header-section-2">
                <div className="section-seperation-left">
                      <CustomSearch
                        search={search}
                        setSearch={setSearch}
                        handleSearch={handleSearch}
                        handleClearSearch={handleClearSearch}
                        placeholder={t("Search")}
                        searchLoading={searchFormLoading}
                        title={t("Search")}
                        dataTestId="form-search-input"
                        width="22rem"
                      />
                </div>
             </div>

      {/* Applications-Drafts Table */}
      <div className="body-section">
        <WrappedTable
          columns={useMemo(() => ([
            { field: "id", headerName: t("Submission ID"), flex: 1, sortable: true },
            {
              field: "created",
              headerName: t("Submitted On"),
              flex: 1,
              sortable: true,
              renderCell: (params) => HelperServices.getLocaldate(params.value),
            },
            {
              field: "modified",
              headerName: t("Last Modified On"),
              flex: 1,
              sortable: true,
              renderCell: (params) => HelperServices.getLocaldate(params.value),
            },
            {
              field: "isDraft",
              headerName: t("Type"),
              flex: 1,
              sortable: true,
              renderCell: (params) => (
                <span className="d-flex align-items-center">
                  {params.value ? (
                    <span className="status-draft"></span>
                  ) : (
                    <span className="status-live"></span>
                  )}
                  {params.value ? t("Draft") : t("Submission")}
                </span>
              ),
            },
            {
              field: "applicationStatus",
              headerName: t("Status"),
              flex: 0.8,
              sortable: true,
              renderCell: (params) => (params.row.isDraft ? "" : params.value),
            },
            {
              field: "actions",
              align: "right",
              flex: 1.5,
              sortable: false,
              cellClassName: "last-column",
              renderCell: (params) => {
                const item = params.row;
                if (item.isDraft) {
                  return (
                    <div>
                      <V8CustomButton
                        variant="warning"
                        label={t("Delete")}
                        onClick={() => deleteDraft(item)}
                        className="me-2"
                      />
                      <V8CustomButton
                        variant="secondary"
                        label={t("Continue")}
                        onClick={() => continueDraft(item)}
                      />
                    </div>
                  );
                } else if (CLIENT_EDIT_STATUS.includes(item.applicationStatus) && canEdit) {
                  return (
                    <V8CustomButton
                      variant="secondary"
                      label={t("Resubmit")}
                      onClick={() => continueResubmit(item)}
                    />
                  );
                } else {
                  return (
                    <V8CustomButton
                      variant="secondary"
                      label={t("View")}
                      onClick={() => viewSubmission(item)}
                    />
                  );
                }
              },
            },
          ]), [t, canEdit])}
          rows={rows}
          rowCount={totalForms}
          loading={isApplicationLoading || searchFormLoading}
          sortingMode="server"
          paginationMode="server"
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationModelChange}
          getRowId={(row) => row.id}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          noRowsLabel={t("No Entries have been found.")}
          onRefresh={fetchSubmissionsAndDrafts}
          dataGridProps={{
            sx: {
              "& .MuiDataGrid-columnHeader--sortable": {
                "& .MuiDataGrid-iconButtonContainer": {
                  visibility: "visible",
                },
                "&:not(.MuiDataGrid-columnHeader--sorted) .MuiDataGrid-sortIcon": {
                  opacity: 0.3,
                },
              },
            },
          }}
        />
        <PromptModal
          show={showDeleteModal}
          onClose={handleCloseActionModal}
          type="warning"
          title={t("Are You Sure You Want to Delete This Draft? ")}
          message={t("This action cannot be undone.")}
          primaryBtnText={t("No, Keep This Draft")}
          primaryBtnAction={handleCloseActionModal}
          primaryBtnDisable={isDeletionLoading}
          buttonLoading={isDeletionLoading}
          secondaryBtnText={t("Yes, Delete this Draft")}
          secondaryBtnAction={confirmDraftDelete}
          primaryBtndataTestid="no-delete-button"
          primaryBtnariaLabel="No, Keep This Draft"
          secondoryBtnariaLabel="Yes, Delete this Draft"
          secondoryBtndataTestid="confirm-delete-draft"
        />
      </div>

    </>
  );
};

export default React.memo(DraftsAndSubmissions);
