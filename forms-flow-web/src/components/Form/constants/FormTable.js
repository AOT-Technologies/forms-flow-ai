import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { useTranslation } from "react-i18next";
import { push } from "connected-react-router";
import { setBPMFormLimit, setBPMFormListPage, setBpmFormSort, setFormDeleteStatus } from "../../../actions/formActions";
import { resetFormProcessData, unPublishForm, getApplicationCount, getProcessDetails } from "../../../apiManager/services/processServices";
import { fetchBPMFormList } from "../../../apiManager/services/bpmFormServices";
import { setFormSearchLoading } from "../../../actions/checkListActions";
import userRoles from "../../../constants/permissions";
import { HelperServices, StyleServices } from "@formsflow/service";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import { V8CustomButton, RefreshIcon, NewSortDownIcon, V8CustomDropdownButton, PromptModal } from "@formsflow/components";
import { deleteForm } from "@aot-technologies/formio-react";
import { fetchFormById } from "../../../apiManager/services/bpmFormServices";
import { formCreate } from "../../../apiManager/services/FormServices";
import { manipulatingFormData } from "../../../apiManager/services/formFormatterService";
import _cloneDeep from "lodash/cloneDeep";
import { toast } from "react-toastify";

function FormTable({ isDuplicating, setIsDuplicating, setDuplicateProgress }) {
  const dispatch = useDispatch();
  const tenantKey = useSelector(state => state.tenants?.tenantId);
  const bpmForms = useSelector(state => state.bpmForms);
  const formData = bpmForms.forms || [];
  const pageNo = useSelector(state => state.bpmForms.formListPage);
  const limit = useSelector(state => state.bpmForms.limit);
  const totalForms = useSelector(state => state.bpmForms.totalForms);
  const formsort = useSelector(state => state.bpmForms.sort);
  const searchFormLoading = useSelector(state => state.formCheckList.searchFormLoading);
  const isApplicationCountLoading = useSelector(state => state.process.isApplicationCountLoading);
  const searchText = useSelector(state => state.bpmForms.searchText);
  const applicationCount = useSelector((state) => state.process?.applicationCount);
  
  // Get form access data from Redux store
  const formAccess = useSelector((state) => state.user?.formAccess || []);
  const submissionAccess = useSelector((state) => state.user?.submissionAccess || []);
  
  const { createDesigns, viewDesigns } = userRoles();
  const { t } = useTranslation();
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const iconColor = StyleServices.getCSSVariable('--ff-gray-medium-dark');
  
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [deleteMessage, setDeleteMessage] = React.useState("");
  const [disableDelete, setDisableDelete] = React.useState(false);
  const [isAppCountLoading, setIsAppCountLoading] = React.useState(false);

  // Mapping between DataGrid field names and reducer sort keys
  const gridFieldToSortKey = {
    title: "formName",
    modified: "modified",
    anonymous: "visibility",
    status: "status",
  };

  const sortKeyToGridField = {
    formName: "title",
    modified: "modified",
    visibility: "anonymous",
    status: "status",
  };

  // 🔹 Delete flow
  const deleteAction = (row) => {
    setSelectedRow(row);
    setShowDeleteModal(true);
    setIsAppCountLoading(true); // start loading state

    dispatch(
      getApplicationCount(row.mapperId, () => {
        setIsAppCountLoading(false); // stop loading once response arrives
      })
    );
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    const formId = selectedRow._id;
    const mapperId = selectedRow.mapperId;
    if (!applicationCount || applicationCount === 0) {
      dispatch(
        deleteForm("form", formId, () => {
          dispatch(fetchBPMFormList({ pageNo, limit, formSort: formsort }));
        })
      );

      if (mapperId) {
        dispatch(unPublishForm(mapperId));
      }
      dispatch(setFormDeleteStatus({ modalOpen: false, formId: "", formName: "" }));
      toast.success(t("Form deleted successfully"));
    }
    handleCloseDelete();
  };

  const handleCloseDelete = () => {
    setShowDeleteModal(false);
    setSelectedRow(null);
  };

  // 🔹 Duplicate flow
  const handleDuplicate = async (row) => {
    try {
      setIsDuplicating(true);
      setDuplicateProgress(0);
      // Fetch the full form data
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
      
      // Create duplicated form data
      const duplicatedForm = _cloneDeep(originalForm);
      
      // Modify title, name, and path
      duplicatedForm.title = `${originalForm.title}-copy`;
      duplicatedForm.name = `${originalForm.name}-copy`;
      duplicatedForm.path = `${originalForm.path}-copy`;

      duplicatedForm.processData = diagramResponse.data.processData;
      duplicatedForm.processType = diagramResponse.data.processType;
      
      // Remove _id and other fields that should not be copied
      delete duplicatedForm._id;
      delete duplicatedForm.machineName;
      delete duplicatedForm.parentFormId;
      
      // Set as new version
      duplicatedForm.componentChanged = true;
      duplicatedForm.newVersion = true;
      
      setDuplicateProgress(80);
      // Manipulate form data with proper formatting
      const newFormData = manipulatingFormData(
        duplicatedForm,
        MULTITENANCY_ENABLED,
        tenantKey,
        formAccess,
        submissionAccess
      );
      
      setDuplicateProgress(90);
      // Create the duplicated form
      const createResponse = await formCreate(newFormData);

      setDuplicateProgress(100);
      const createdForm = createResponse.data;
            
      // Redirect to edit page of duplicated form
      dispatch(push(`${redirectUrl}formflow/${createdForm._id}/edit`));
      
    } catch (err) {
      console.error("Error duplicating form:", err);
      // const errorMessage = err.response?.data?.message || err.message || "Failed to duplicate form";
    } finally {
      setIsDuplicating(false);
    }
  };

  // Watch for application count updates
  React.useEffect(() => {
    if (selectedRow) {
      if (isAppCountLoading) {
        setDeleteMessage(t("Preparing for delete..."));
        setDisableDelete(true);
      } else if (applicationCount > 0) {
        setDeleteMessage(
          t(`This form has ${applicationCount} submission(s). You can’t delete it.`)
        );
        setDisableDelete(true);
      } else {
        setDeleteMessage(t("Are you sure you want to delete this form?"));
        setDisableDelete(false);
      }
    }
  }, [applicationCount, selectedRow, isAppCountLoading, t]);
  // Prepare DataGrid columns
  const columns = [
    {
      field: "title",
      headerName: t("Name"),
      flex: 1,
      sortable: true,
      width: 180,
      height: 55,
    },
    {
      field: "description",
      headerName: t("Description"),
      flex: 1,
      sortable: false,
      width: 180,
      height: 55,
      renderCell: params => (
        <span>
          {params.row.description ? (new DOMParser().parseFromString(params.row.description, 'text/html').body.textContent) : ""}
        </span>
      )
    },
    {
      field: "modified",
      headerName: t("Last Edited"),
      flex: 1,
      sortable: true,
      width: 180,
      height: 55,
      renderCell: params => HelperServices.getLocaldate(params.row.modified),
    },
    {
      field: "anonymous",
      headerName: t("Visibility"),
      flex: 1,
      sortable: true,
      renderCell: params => params.value ? t("Public") : t("Private"),
      width: 180,
      height: 55,
    },
    {
      field: "status",
      headerName: t("Status"),
      flex: 1,
      sortable: true,
      width: 180,
      height: 55,
      renderCell: params => (
        <span className="d-flex align-items-center">
          {params.value === "active" ?
            <span className="status-live"></span> :
            <span className="status-draft"></span>}
          {params.value === "active" ? t("Live") : t("Draft")}
        </span>
      ),
    },
    {
      field: "actions",
      renderHeader: () => (
        <V8CustomButton
          // label="new button"
          variant="secondary"
          icon={<RefreshIcon color={iconColor} />}
          iconOnly
          onClick={handleRefresh}
        />
      ),
      flex: 1,
      sortable: false,
      cellClassName: "last-column",
      renderCell: params => {
        const dropdownItems = [
          {
            label: t("Duplicate form"),
            onClick: () => handleDuplicate(params.row),
          },
          {
            label: params.row.status === "active" ? t("Unpublish") : t("Delete"),
            onClick: () => {
              if (params.row.status === "active") {
                // dispatch(unPublishForm(params.row.mapperId));
              } else {
                deleteAction(params.row);
              }
            },
            className: params.row.status !== "active" ? "delete-dropdown-item" : "",
          },
        ];
        return (createDesigns || viewDesigns) && (
          <V8CustomDropdownButton
          label={t("Edit")}
          variant="secondary"
          menuPosition="right"
          dropdownItems={dropdownItems}
          disabled={isDuplicating}
          onLabelClick= {() => viewOrEditForm(params.row._id, "edit")}
        />
        );
      }
    },
  ];

const viewOrEditForm = (formId, path) => {
  dispatch(resetFormProcessData());
  dispatch(push(`${redirectUrl}formflow/${formId}/${path}`));
};
  const handlePageChange = (page) => {
    dispatch(setBPMFormListPage(page));
  };
  
  const handleSortChange = (modelArray) => {
    const model = Array.isArray(modelArray) ? modelArray[0] : modelArray;
    if (!model || !model.field || !model.sort) {
      const resetSort = Object.keys(formsort).reduce((acc, key) => {
        acc[key] = { sortOrder: "asc" };
        return acc;
      }, {});
      dispatch(setBpmFormSort({ ...resetSort, activeKey: "formName" }));
      dispatch(setBPMFormListPage(1)); 
      return;
    }

    const mappedKey = gridFieldToSortKey[model.field] || model.field;
    const order = model.sort; 

    const updatedSort = Object.keys(formsort).reduce((acc, columnKey) => {
      acc[columnKey] = { sortOrder: columnKey === mappedKey ? order : "asc" };
      return acc;
    }, {});
    dispatch(setBpmFormSort({ ...updatedSort, activeKey: mappedKey }));
  };
  

  const handleLimitChange = (limitVal) => {
    dispatch(setBPMFormLimit(limitVal));
    dispatch(setBPMFormListPage(1));
  };

  const handleRefresh = () => {
    let filters = {pageNo, limit, formSort: formsort, formName: searchText};
    dispatch(setFormSearchLoading(true));
    dispatch(fetchBPMFormList({...filters}));
  };
  
  const activeKey = bpmForms.sort?.activeKey || "formName";
  const activeField = sortKeyToGridField[activeKey] || activeKey;
  const activeOrder = bpmForms.sort?.[activeKey]?.sortOrder || "asc";
  const onPaginationModelChange = ({ page, pageSize }) => {
    if (limit !== pageSize) handleLimitChange(pageSize);
    else if ((pageNo - 1) !== page) handlePageChange(page + 1);
  };
  const rows = React.useMemo(() => {
    return (formData || []).map((f) => ({
      ...f,
      id: f._id || f.path || f.name,
    })).filter(r => r.id);
  }, [formData]);
  const paginationModel = React.useMemo(
    () => ({ page: pageNo - 1, pageSize: limit }),
    [pageNo, limit]
  );
  
  
  return (
    <>
    <Paper sx={{ height: {sm: 400, md: 510, lg: 665}, width: "100%" }}>
      <DataGrid
        disableColumnResize // disabed resizing
        columns={columns}
        rows={rows}
        rowCount={totalForms}
        loading={searchFormLoading || isApplicationCountLoading}
        paginationMode="server"
        sortingMode="server"
        disableColumnMenu
        sortModel={[{ field: activeField, sort: activeOrder }]}
        onSortModelChange={handleSortChange}
        paginationModel={paginationModel}
        getRowId={(row) => row.id}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={[10, 25, 50, 100]}
        rowHeight={55}
        disableRowSelectionOnClick
        slots={{
          columnSortedDescendingIcon: () => (
            <div>
              <NewSortDownIcon color={iconColor} />
            </div>
          ),
          columnSortedAscendingIcon: () => (
            <div style={{ transform: "rotate(180deg)" }}>
              <NewSortDownIcon color={iconColor} />
            </div>
          ),
          // columnUnsortedIcon: RefreshIcon,
        }}
        slotProps={{
          loadingOverlay: {
            variant: 'skeleton',
            noRowsVariant: 'skeleton',
          },
        }}
      />
    </Paper>
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
}

export default FormTable;