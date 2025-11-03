import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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

  // Track the most recent page requested to ignore older pagination events emitted by the grid
  const lastRequestedPageRef = React.useRef(null);

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
      const isAlreadyDefault =
        (formsort?.activeKey || "formName") === "formName" &&
        (formsort?.formName?.sortOrder || "asc") === "asc";
      if (!isAlreadyDefault) {
        const resetSort = Object.keys(formsort).reduce((acc, key) => {
          acc[key] = { sortOrder: "asc" };
          return acc;
        }, {});
        dispatch(setClientFormListSort({ ...resetSort, activeKey: "formName" }));
      }
      return;
    }

    // Guard: do nothing if incoming sort equals current sort
    const incomingField = model.field;
    const incomingOrder = model.sort;
    const currentActiveKey = formsort?.activeKey || "formName";
    const currentField = sortKeyToGridField[currentActiveKey] || currentActiveKey;
    const currentOrder = formsort?.[currentActiveKey]?.sortOrder || "asc";
    if (incomingField === currentField && incomingOrder === currentOrder) {
      return;
    }

    const mappedKey = gridFieldToSortKey[incomingField] || incomingField;
    const updatedSort = Object.keys(formsort).reduce((acc, columnKey) => {
      acc[columnKey] = {
        sortOrder: columnKey === mappedKey ? incomingOrder : "asc",
      };
      return acc;
    }, {});
    dispatch(setClientFormListSort({ ...updatedSort, activeKey: mappedKey }));
  };

  const onPaginationModelChange = ({ page, pageSize }) => {
    if (typeof page === "number" && pageNo - 1 !== page) {
      const requestedPage = page + 1;
      const lastRequestedPage = lastRequestedPageRef.current;

      if (lastRequestedPage && requestedPage < lastRequestedPage) {
        return;
      }

      lastRequestedPageRef.current = requestedPage;
      dispatch(setClientFormListPage(requestedPage));
      return;
    }

    const isValidPageSize = typeof pageSize === "number" && pageSize > 0;
    if (isValidPageSize && limit !== pageSize) {
      lastRequestedPageRef.current = 1;
      dispatch(setClientFormLimit(pageSize));
      dispatch(setClientFormListPage(1));
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

  const paginationModel = React.useMemo(
    () => ({ page: pageNo - 1, pageSize: limit }),
    [pageNo, limit]
  );

  const activeKey = formsort?.activeKey || "formName";
  const activeField = sortKeyToGridField[activeKey] || activeKey;
  const activeOrder = formsort?.[activeKey]?.sortOrder || "asc";

  return (
    <>
      <ReusableTable
        columns={columns}
        rows={rows}
        rowCount={totalForms}
        loading={searchFormLoading}
        sortModel={[{ field: activeField, sort: activeOrder }]}
        onSortModelChange={handleSortChange}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        getRowId={(row) => row.id}
        noRowsLabel={t("No Forms have been found.")}
      />
      {showSubmissions && <SubmissionDrafts />}
    </>
  );
}

export default ClientTable;
