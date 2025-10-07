import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import {
  setClientFormLimit,
  setClientFormListPage,
  setClientFormListSort
} from "../../../actions/formActions";
import { HelperServices, StyleServices } from "@formsflow/service";
import { useTranslation } from "react-i18next";
import {
  V8CustomButton,
  NewSortDownIcon,
  RefreshIcon
} from "@formsflow/components";
import { navigateToFormEntries } from "../../../helper/routerHelper";
import SubmissionDrafts from "../../../routes/Submit/Forms/DraftAndSubmissions";
import { fetchBPMFormList } from "../../../apiManager/services/bpmFormServices"; 
import { setFormSearchLoading } from "../../../actions/checkListActions";  

function ClientTable() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const bpmForms = useSelector((state) => state.bpmForms);
  const searchFormLoading = useSelector((state) => state.formCheckList.searchFormLoading);
  const searchText = useSelector((state) => state.bpmForms.clientFormSearch); 
  const [showSubmissions, setShowSubmissions] = useState(false);

  const formData = bpmForms?.forms || [];
  const pageNo = useSelector((state) => state.bpmForms.submitListPage);
  const limit = useSelector((state) => state.bpmForms.submitFormLimit);
  const totalForms = useSelector((state) => state.bpmForms.totalForms);
  const formsort = useSelector((state) => state.bpmForms.submitFormSort);
  const iconColor = StyleServices.getCSSVariable("--ff-gray-medium-dark");

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
    let doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const showFormEntries = (parentFormId) => {
    setShowSubmissions(true);
    navigateToFormEntries(dispatch, tenantKey, parentFormId);
  };

  const handleSortChange = (modelArray) => {
    const model = Array.isArray(modelArray) ? modelArray[0] : modelArray;
    if (!model || !model.field || !model.sort) {
      const resetSort = Object.keys(formsort).reduce((acc, key) => {
        acc[key] = { sortOrder: "asc" };
        return acc;
      }, {});
      dispatch(setClientFormListSort({ ...resetSort, activeKey: "formName" }));
      dispatch(setClientFormListPage(1));
      return;
    }

    const mappedKey = gridFieldToSortKey[model.field] || model.field;
    const order = model.sort;

    const updatedSort = Object.keys(formsort).reduce((acc, columnKey) => {
      acc[columnKey] = {
        sortOrder: columnKey === mappedKey ? order : "asc",
      };
      return acc;
    }, {});
    dispatch(setClientFormListSort({ ...updatedSort, activeKey: mappedKey }));
  };

  const onPaginationModelChange = ({ page, pageSize }) => {
    if (limit !== pageSize) {
      dispatch(setClientFormLimit(pageSize));
      dispatch(setClientFormListPage(1));
    } else if (pageNo - 1 !== page) {
      dispatch(setClientFormListPage(page + 1));
    }
  };

    const handleRefresh = () => {
    dispatch(setFormSearchLoading(true));
    dispatch(fetchBPMFormList({
      pageNo,
      limit,
      formSort: formsort,
      formName: searchText,
      showForOnlyCreateSubmissionUsers: true,
      includeSubmissionsCount: true
    }));
  };

  const columns = [
    {
      field: "title",
      headerName: t("Form Name"),
      flex: 1,
      sortable: true,
    },
    {
      field: "description",
      headerName: t("Description"),
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <span title={stripHtml(params.row.description)}>
          {stripHtml(params.row.description)}
        </span>
      ),
    },
    {
      field: "submissionsCount",
      headerName: t("Submissions"),
      flex: 1,
      sortable: true,
    },
    {
      field: "latestSubmission",
      headerName: t("Latest Submission"),
      flex: 1,
      sortable: true,
      renderCell: (params) =>
        HelperServices?.getLocaldate(params.row.latestSubmission),
    },
    {
      field: "actions",
      align: "right",
      renderHeader: () => (
        <V8CustomButton
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
        <V8CustomButton
          label="Select"
          variant="secondary"
          onClick={() => showFormEntries(params.row.parentFormId)}
        />
      )
    },
  ];

  const rows = React.useMemo(() => {
    return (formData || []).map((f) => ({
      ...f,
      id: f._id,
      title: f.title,
    }));
  }, [formData]);

  const paginationModel = React.useMemo(
    () => ({ page: pageNo - 1, pageSize: limit }),
    [pageNo, limit]
  );

  const activeKey = formsort?.activeKey || "formName";
  const activeField = sortKeyToGridField[activeKey] || activeKey;
  const activeOrder = formsort?.[activeKey]?.sortOrder || "asc";

  return (
    <>
      <Paper sx={{ height: { sm: 400, md: 510, lg: 510 }, width: "100%" }}>
        <DataGrid
          columns={columns}
          rows={rows}
          rowCount={totalForms}
          loading={searchFormLoading}
          paginationMode="server"
          sortingMode="server"
          disableColumnMenu
          sortModel={[{ field: activeField, sort: activeOrder }]}
          onSortModelChange={handleSortChange}
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationModelChange}
          pageSizeOptions={[10, 25, 50, 100]}
          rowHeight={55}
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
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
          }}
          slotProps={{
            loadingOverlay: {

              variant: "skeleton",
              noRowsVariant: "skeleton",
            },
          }}
        />
      </Paper>
      {showSubmissions && <SubmissionDrafts />}
    </>
  );
}

export default ClientTable;
