import React, { useState } from "react";
import { useDispatch, useSelector, batch } from "react-redux";
import {
  setClientFormLimit,
  setClientFormListPage,
  setClientFormListSort
} from "../../../actions/formActions";
import { HelperServices, StyleServices } from "@formsflow/service";
import { useTranslation } from "react-i18next";
import {
  V8CustomButton,
  RefreshIcon,
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
    /* eslint-disable no-console */
    console.log("[ClientTable][INTERNAL_SORT] called", { 
      modelArray, 
      hasExternal: !!externalOnSortModelChange 
    });
    /* eslint-enable no-console */
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
    /* eslint-disable no-console */
    console.log("[ClientTable][INTERNAL_PAGINATION] called", { 
      page, 
      pageSize, 
      currentPage: pageNo,
      currentLimit: limit,
      hasExternal: !!externalOnPaginationModelChange 
    });
    /* eslint-enable no-console */
    const requestedPage = typeof page === "number" ? page + 1 : pageNo;
    const requestedLimit = typeof pageSize === "number" ? pageSize : limit;
    // Batch multiple dispatches to keep Redux updates atomic
    batch(() => {
      if (requestedLimit !== limit) {
        /* eslint-disable no-console */
        console.log("[ClientTable][INTERNAL_PAGINATION] limit changed, resetting to page 1");
        /* eslint-enable no-console */
        dispatch(setClientFormLimit(requestedLimit));
        dispatch(setClientFormListPage(1));
      } else {
        /* eslint-disable no-console */
        console.log("[ClientTable][INTERNAL_PAGINATION] page changed to", requestedPage);
        /* eslint-enable no-console */
        dispatch(setClientFormListPage(requestedPage));
      }
    });
  };

  const handleRefresh = () => {
    /* eslint-disable no-console */
    console.log("[ClientTable][REFRESH] called", { hasExternal: !!externalOnRefresh });
    /* eslint-enable no-console */
    if (externalOnRefresh) {
      /* eslint-disable no-console */
      console.log("[ClientTable][REFRESH] using external handler");
      /* eslint-enable no-console */
      externalOnRefresh();
      return;
    }
    /* eslint-disable no-console */
    console.log("[ClientTable][REFRESH] using internal handler");
    /* eslint-enable no-console */
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

  const internalPaginationModel = React.useMemo(
    () => {
      const model = { page: pageNo - 1, pageSize: limit };
      /* eslint-disable no-console */
      console.log("[ClientTable][PAGINATION_MODEL] memoized", { 
        model, 
        pageNo, 
        limit,
        usingExternal: !!externalPaginationModel 
      });
      /* eslint-enable no-console */
      return model;
    },
    [pageNo, limit, externalPaginationModel]
  );
  const paginationModel = externalPaginationModel || internalPaginationModel;

  const activeKey = formsort?.activeKey || "formName";
  const activeField = sortKeyToGridField[activeKey] || activeKey;
  const activeOrder = formsort?.[activeKey]?.sortOrder || "asc";
  const internalSortModel = React.useMemo(
    () => {
      const model = [{ field: activeField, sort: activeOrder }];
      /* eslint-disable no-console */
      console.log("[ClientTable][SORT_MODEL] memoized", { 
        model,
        usingExternal: !!externalSortModel 
      });
      /* eslint-enable no-console */
      return model;
    },
    [activeField, activeOrder, externalSortModel]
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
      />
      {showSubmissions && <SubmissionDrafts />}
    </>
  );
}

export default ClientTable;
