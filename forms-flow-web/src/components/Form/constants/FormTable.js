import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { useTranslation } from "react-i18next";
import { push } from "connected-react-router";
import { setBPMFormLimit, setBPMFormListPage, setBpmFormSort } from "../../../actions/formActions";
import { resetFormProcessData } from "../../../apiManager/services/processServices";
import { fetchBPMFormList } from "../../../apiManager/services/bpmFormServices";
import { setFormSearchLoading } from "../../../actions/checkListActions";
import userRoles from "../../../constants/permissions";
import { HelperServices,StyleServices } from "@formsflow/service";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import { V8CustomButton,RefreshIcon,NewSortDownIcon,V8CustomDropdownButton } from "@formsflow/components";


function FormTable() {
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
  const { createDesigns, viewDesigns } = userRoles();
  const { t } = useTranslation();
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const iconColor = StyleServices.getCSSVariable('--ff-gray-medium-dark');

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
      renderCell: params => (
        (createDesigns || viewDesigns) && (
          <V8CustomDropdownButton
          label={t("Edit")}
          variant="secondary"
          menuPosition="right"
          dropdownItems={[]}
          onLabelClick= {() => viewOrEditForm(params.row._id, "edit")}
        />
        )
      )
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
    <Paper sx={{ height: {sm: 400, md: 510, lg: 510}, width: "100%" }}>
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
  );
}

export default FormTable;