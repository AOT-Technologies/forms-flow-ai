import React, { useState } from "react";
import { useDispatch, useSelector, batch } from "react-redux";
import {
  setClientFormLimit,
  setClientFormListPage,
  setClientFormListSort
} from "../../../actions/formActions";
import { HelperServices } from "@formsflow/service";
import { useTranslation } from "react-i18next";
import {
  V8CustomButton,
  ReusableTable
} from "@formsflow/components";
import { navigateToFormEntries } from "../../../helper/routerHelper";
import SubmissionDrafts from "../../../routes/Submit/Forms/DraftAndSubmissions";
import { fetchBPMFormList } from "../../../apiManager/services/bpmFormServices"; 
import { setFormSearchLoading } from "../../../actions/checkListActions";


function ClientTable({
  externalSortModel,
  externalOnSortModelChange,
  externalPaginationModel,
  externalOnPaginationModelChange,
  externalOnRefresh,
}) {
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

    // No sort provided – only reset if not already at default
    if (!model?.field || !model?.sort) {
      const resetSort = Object.keys(formsort).reduce((acc, key) => {
        acc[key] = { sortOrder: "asc" };
        return acc;
      }, {});
      dispatch(setClientFormListSort({ ...resetSort, activeKey: "formName" }));
      return;
    }

    const mappedKey = gridFieldToSortKey[model.field] || model.field;
    const updatedSort = Object.keys(formsort).reduce((acc, columnKey) => {
      acc[columnKey] = {
        sortOrder: columnKey === mappedKey ? model.sort : "asc",
      };
      return acc;
    }, {});
    dispatch(setClientFormListSort({ ...updatedSort, activeKey: mappedKey }));
  };

  const onPaginationModelChange = ({ page, pageSize }) => {
    const requestedPage = typeof page === "number" ? page + 1 : pageNo;
    const requestedLimit = typeof pageSize === "number" ? pageSize : limit;
    // Batch multiple dispatches to keep Redux updates atomic
    batch(() => {
      if (requestedLimit !== limit) {
        dispatch(setClientFormLimit(requestedLimit));
        dispatch(setClientFormListPage(1));
      } else {
        dispatch(setClientFormListPage(requestedPage));
      }
    });
  };

  const handleRefresh = () => {
    if (externalOnRefresh) {
      externalOnRefresh();
      return;
    }
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
      renderCell: (params) => (
        <span title={params.value}>
          {params.value}
        </span>
      ),
    },
    {
      field: "description",
      headerName: t("Description"),
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const description = stripHtml(params.row.description);
        return (
          <span title={description}>
            {description}
          </span>
        );
      },
    },
    {
      field: "submissionsCount",
      headerName: t("Submissions"),
      flex: 1,
      sortable: true,
      renderCell: (params) => (
        <span>
          {params.value}
        </span>
      ),
    },
    {
      field: "latestSubmission",
      headerName: t("Latest Submission"),
      flex: 1,
      sortable: true,
      renderCell: (params) => {
        const dateValue = HelperServices?.getLocaldate(params.row.latestSubmission);
        return (
          <span title={dateValue}>
            {dateValue}
          </span>
        );
      },
    },
    {
      field: "actions",
      align: "right",
      renderHeader: () => (
        <V8CustomButton
          variant="secondary"
          label={t("Refresh")}
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

  const internalPaginationModel = React.useMemo(
    () => ({ page: pageNo - 1, pageSize: limit }),
    [pageNo, limit]
  );
  const paginationModel = externalPaginationModel || internalPaginationModel;

  const activeKey = formsort?.activeKey || "formName";
  const activeField = sortKeyToGridField[activeKey] || activeKey;
  const activeOrder = formsort?.[activeKey]?.sortOrder || "asc";
  const internalSortModel = React.useMemo(
    () => [{ field: activeField, sort: activeOrder }],
    [activeField, activeOrder]
  );
  const sortModel = externalSortModel || internalSortModel;

  return (
    <>
      <ReusableTable
        columns={columns}
        rows={rows}
        rowCount={totalForms}
        loading={searchFormLoading}
        sortModel={sortModel}
        onSortModelChange={externalOnSortModelChange || handleSortChange}
        paginationModel={paginationModel}
        onPaginationModelChange={externalOnPaginationModelChange || onPaginationModelChange}
        getRowId={(row) => row.id}
        noRowsLabel={t("No Forms have been found.")}
        autoHeight={true}
      />
      {showSubmissions && <SubmissionDrafts />}
    </>
  );
}

export default ClientTable;
