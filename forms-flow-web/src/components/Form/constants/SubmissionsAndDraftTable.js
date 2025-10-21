import React, {useState, useEffect} from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectRoot } from "@aot-technologies/formio-react";
import { CLIENT_EDIT_STATUS } from "../../../constants/applicationConstants";
import {
    setApplicationListActivePage,
    setCountPerpage,
    setFormSubmissionSort,
} from "../../../actions/applicationActions";
import { useTranslation } from "react-i18next";
import { PromptModal, V8CustomButton, RefreshIcon, ReusableTable } from "@formsflow/components";
import { toast } from "react-toastify";
import { deleteDraftbyId } from "../../../apiManager/services/draftService";
import { navigateToDraftEdit, navigateToViewSubmission, navigateToResubmit } from "../../../helper/routerHelper";
import PropTypes from "prop-types";
import { HelperServices, StyleServices } from "@formsflow/service";

const SubmissionsAndDraftTable = ({ fetchSubmissionsAndDrafts }) => {
    const tenantKey = useSelector((state) => state.tenants?.tenantId);
    const iconColor = StyleServices.getCSSVariable("--ff-gray-medium-dark");
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const {
        draftAndSubmissionsList,
        activePage: pageNo,
        countPerPage: limit,
        applicationCount: totalForms,
        sort: applicationSort
    } = useSelector((state) => state.applications);
    const searchFormLoading = useSelector(
        (state) => state.formCheckList.searchFormLoading
    );
    const [canEdit, setCanEdit] = useState(false);
    const userRoles = useSelector((state) => selectRoot("user", state).roles);
    const isApplicationLoading = useSelector((state) =>
        state.applications.isApplicationLoading);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteDraftId, setDeleteDraftId] = useState('');
    const [isDeletionLoading, setIsDeletionLoading] = useState(false);

  const gridFieldToSortKey = {
    id: "id",
    created: "created",
    modified: "modified",
    isDraft: "type",
    applicationStatus: "applicationStatus",
  };

  const sortKeyToGridField = {
    id: "id",
    created: "created",
    modified: "modified",
    type: "isDraft",
    applicationStatus: "applicationStatus",
  };

    useEffect(() => {
        setCanEdit(userRoles?.includes("create_submissions"));
    }, [userRoles]);

    const continueResubmit = (row) => {
        navigateToResubmit(dispatch, tenantKey, row.formId, row.submissionId);
    };

  const handleSortChange = (modelArray) => {
    const model = Array.isArray(modelArray) ? modelArray[0] : modelArray;
    if (!model?.field || !model?.sort) {
      const resetSort = Object.keys(applicationSort).reduce((acc, key) => {
        acc[key] = { sortOrder: "asc" };
        return acc;
      }, {});
      dispatch(setFormSubmissionSort({ ...resetSort, activeKey: "id" }));
      dispatch(setApplicationListActivePage(1));
      return;
    }

    const mappedKey = gridFieldToSortKey[model.field] || model.field;
    const order = model.sort;

    const updatedSort = Object.keys(applicationSort).reduce((acc, columnKey) => {
      acc[columnKey] = { sortOrder: columnKey === mappedKey ? order : "asc" };
      return acc;
    }, {});

        dispatch(setFormSubmissionSort({
            ...updatedSort,
            activeKey: mappedKey,
        }));
    };

    const continueDraft = (row) => {
        navigateToDraftEdit(dispatch, tenantKey, row.formId, row.id);
    };


    const deleteDraft = (row) => {
        setDeleteDraftId(row.id);
        setShowDeleteModal(true);
    };

    const handleCloseActionModal = () => {
        setDeleteDraftId('');
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
    

    const viewSubmission = (item) => {
        navigateToViewSubmission(dispatch, tenantKey, item.formId, item.id);
    };

  const onPaginationModelChange = ({ page, pageSize }) => {
    if (limit !== pageSize) {
      dispatch(setCountPerpage(pageSize));
      dispatch(setApplicationListActivePage(1));
    } else if (pageNo !== page + 1) {
      dispatch(setApplicationListActivePage(page + 1));
    }
  };

  const handleRefresh = () => {
    fetchSubmissionsAndDrafts();
  };

  const columns = [
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
      headerName: t("Action"),
      flex: 1.5,
      sortable: false,
      align: "right",
      renderHeader: () => (
        <V8CustomButton
          variant="secondary"
          icon={<RefreshIcon color={iconColor} />}
          iconOnly
          onClick={handleRefresh}
        />
      ),
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
  ];

  const rows = draftAndSubmissionsList?.applications || [];
  const paginationModel = React.useMemo(
    () => ({ page: pageNo - 1, pageSize: limit }),
    [pageNo, limit]
  );

  const activeKey = applicationSort?.activeKey || "id";
  const activeField = sortKeyToGridField[activeKey] || activeKey;
  const activeOrder = applicationSort?.[activeKey]?.sortOrder || "asc";

  return (
    <>
      <ReusableTable
        columns={columns}
        rows={rows}
        rowCount={totalForms}
        loading={isApplicationLoading || searchFormLoading}
        sortModel={[{ field: activeField, sort: activeOrder }]}
        onSortModelChange={handleSortChange}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        getRowId={(row) => row.id}
        noRowsLabel={t("No Entries have been found.")}
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
        primaryBtnLoading={isDeletionLoading}
        secondaryBtnText={t("Yes, Delete this Draft")}
        secondaryBtnAction={confirmDraftDelete}
        primaryBtndataTestid="no-delete-button"
        primaryBtnariaLabel="No, Keep This Draft"
        secondoryBtnariaLabel="Yes, Delete this Draft"
        secondoryBtndataTestid="confirm-delete-draft"
      />
    </>
  );
};

SubmissionsAndDraftTable.propTypes = {
  fetchSubmissionsAndDrafts: PropTypes.func.isRequired,
};

export default SubmissionsAndDraftTable;