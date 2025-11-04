import React, { useMemo, useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector, batch } from "react-redux";
import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { HelperServices } from "@formsflow/service";
import { RefreshIcon, V8CustomButton, V8CustomDropdownButton, NewSortDownIcon } from "@formsflow/components";
import {
  setClientFormLimit,
  setClientFormListPage,
  setClientFormListSort,
  setBPMFormLimit,
  setBPMFormListPage,
  setBpmFormSort,
  setBPMFormListLoading,
} from "../../actions/formActions";
import { setFormSearchLoading } from "../../actions/checkListActions";
import { fetchBPMFormList } from "../../apiManager/services/bpmFormServices";
import { fetchAllProcesses } from "../../apiManager/services/processServices";
import { setBpmSort, setDmnSort } from "../../actions/processActions";
import { StyleServices } from "@formsflow/service";

/**
 * Common server-backed DataGrid for forms listing.
 * mode: 'submit' | 'designer'
 */
const FormListGrid = ({ mode = "submit", processType, onProcessEdit, canProcessEdit, onDesignerEdit, onSubmitSelect, disableColumnResize = true, dropdownItems = [], isDuplicating, viewOrEditForm }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const iconColor = StyleServices.getCSSVariable("--ff-gray-medium-dark");
  const dropdownItemsSafe = useMemo(
    () => {
      if (!dropdownItems || !Array.isArray(dropdownItems)) {
        return [];
      }
      return dropdownItems;
    },
    [dropdownItems]
  );
  // Default sort icons for DataGrid
  const defaultSlots = useMemo(
    () => ({
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
    }),
    [iconColor]
  );

  const isSubmit = mode === "submit";
  const isProcess = mode === "process";
  const isBPMN = isProcess ? processType === "BPMN" : false;

  // Shared selectors
  const searchFormLoading = useSelector((state) => state.formCheckList.searchFormLoading);
  const forms = useSelector((state) => state.bpmForms.forms) || [];
  const totalForms = useSelector((state) => state.bpmForms.totalForms) || 0;
  const tenantKey = useSelector((state) => state.tenants?.tenantId);

  // Mode-specific selectors
  const pageNoRedux = useSelector((state) => (
    isSubmit ? state.bpmForms.submitListPage : state.bpmForms.formListPage
  ));
  const limitRedux = useSelector((state) => (
    isSubmit ? state.bpmForms.submitFormLimit : state.bpmForms.limit
  ));
  const sortState = useSelector((state) => (
    isProcess
      ? (isBPMN ? state.process.bpmsort : state.process.dmnSort)
      : (isSubmit ? state.bpmForms.submitFormSort : state.bpmForms.sort)
  ));
  const searchText = useSelector((state) => (
    isProcess
      ? (isBPMN ? state.process.bpmnSearchText : state.process.dmnSearchText)
      : (isSubmit ? state.bpmForms.clientFormSearch : state.bpmForms.searchText)
  ));

  // Process mode specific state/selectors
  const processList = useSelector((state) => (
    isProcess ? (isBPMN ? state.process.processList : state.process.dmnProcessList) : []
  )) || [];
  const totalProcesses = useSelector((state) => (
    isProcess ? (isBPMN ? state.process.totalBpmnCount : state.process.totalDmnCount) : 0
  )) || 0;
  const [processPaging, setProcessPaging] = useState({ pageNo: 1, limit: 10 });
  const [isProcessLoading, setIsProcessLoading] = useState(false);

  const pageNo = isProcess ? processPaging.pageNo : pageNoRedux;
  const limit = isProcess ? processPaging.limit : limitRedux;

  // Fetch effect
  useEffect(() => {
    if (isProcess) {
      setIsProcessLoading(true);
      const activeKey = sortState?.activeKey;
      const sortOrder = sortState?.[activeKey]?.sortOrder || "asc";
      dispatch(
        fetchAllProcesses(
          {
            pageNo,
            tenant_key: tenantKey,
            processType: isBPMN ? "BPMN" : "DMN",
            limit,
            searchKey: searchText,
            sortBy: activeKey,
            sortOrder,
          },
          () => setIsProcessLoading(false)
        )
      );
    } else {
      dispatch(setFormSearchLoading(true));
      if (!isSubmit) dispatch(setBPMFormListLoading(true));
      dispatch(
        fetchBPMFormList({
          pageNo,
          limit,
          formSort: sortState,
          formName: searchText,
          ...(isSubmit
            ? { showForOnlyCreateSubmissionUsers: true, includeSubmissionsCount: true }
            : {}),
        })
      );
    }
  }, [
    dispatch,
    isProcess,
    isSubmit,
    isBPMN,
    pageNo,
    limit,
    sortState,
    searchText,
    tenantKey,
  ]);

  // Sort mapping
  const gridFieldToSortKey = isSubmit
    ? {
        title: "formName",
        submissionsCount: "submissionCount",
        latestSubmission: "latestSubmission",
      }
    : {
        title: "formName",
        modified: "modified",
        anonymous: "visibility",
        status: "status",
      };

  const sortKeyToGridField = isSubmit
    ? { formName: "title", submissionCount: "submissionsCount", latestSubmission: "latestSubmission" }
    : { formName: "title", modified: "modified", visibility: "anonymous", status: "status" };

  // Columns
  const columns = useMemo(() => {
    const base = [
      ...(isProcess
        ? [
            {
              field: "name",
              headerName: t("Name"),
              flex: 1,
              sortable: true,
              renderCell: (params) => <span title={params.value}>{params.value}</span>,
            },
            {
              field: "processKey",
              headerName: t("ID"),
              flex: 1,
              sortable: true,
              renderCell: (params) => <span title={params.value}>{params.value}</span>,
            },
          ]
        : [
            {
              field: "title",
              headerName: isSubmit ? t("Form Name") : t("Name"),
              flex: 1,
              sortable: true,
              renderCell: (params) => <span title={params.value}>{params.value}</span>,
            },
            {
              field: "description",
              headerName: t("Description"),
              flex: 1,
              sortable: false,
              renderCell: (params) => {
                const doc = new DOMParser().parseFromString(params.row.description || "", "text/html");
                const text = doc.body.textContent || "";
                return <span title={text}>{text}</span>;
              },
            },
          ])
    ];

    if (isProcess) {
      base.push(
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
          field: "status",
          headerName: t("Status"),
          flex: 1,
          sortable: true,
          renderCell: (params) => (
            <span className="d-flex align-items-center">
              {params.value === "Published" ? (
                <span className="status-live"></span>
              ) : (
                <span className="status-draft"></span>
              )}
              {params.value === "Published" ? t("Live") : t("Draft")}
            </span>
          ),
        }
      );
    } else if (isSubmit) {
      base.push(
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
        }
      );
    } else {
      base.push(
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
        }
      );
    }

    base.push({
      field: "actions",
      align: "right",
      renderHeader: () => (
        <V8CustomButton
          variant="secondary"
          icon={<RefreshIcon color={iconColor} />}
          iconOnly
          onClick={() => {
            if (isProcess) {
              setIsProcessLoading(true);
              const activeKey = sortState?.activeKey;
              const sortOrder = sortState?.[activeKey]?.sortOrder || "asc";
              dispatch(
                fetchAllProcesses(
                  {
                    pageNo,
                    tenant_key: tenantKey,
                    processType: isBPMN ? "BPMN" : "DMN",
                    limit,
                    searchKey: searchText,
                    sortBy: activeKey,
                    sortOrder,
                  },
                  () => setIsProcessLoading(false)
                )
              );
            } else {
              dispatch(setFormSearchLoading(true));
              dispatch(
                fetchBPMFormList({
                  pageNo,
                  limit,
                  formSort: sortState,
                  formName: searchText,
                  ...(isSubmit
                    ? {
                        showForOnlyCreateSubmissionUsers: true,
                        includeSubmissionsCount: true,
                      }
                    : {}),
                })
              );
            }
          }}
        />
      ),
      flex: 1,
      sortable: false,
      cellClassName: "last-column",
      renderCell: (params) => {
        if (isProcess && canProcessEdit) {
          return (
            <V8CustomDropdownButton
              label={t("Edit")}
              variant="secondary"
              menuPosition="right"
              dropdownItems={dropdownItemsSafe}
              disabled={isDuplicating}
              onLabelClick={() => {
                if (typeof viewOrEditForm === "function") {
                  viewOrEditForm(params.row._id, "edit");
                } else if (typeof onProcessEdit === "function") {
                  onProcessEdit(params.row);
                }
              }}
            />
          );
        }
        if (isSubmit && typeof onSubmitSelect === "function") {
          return (
            <V8CustomButton
              label={t("Select")}
              variant="secondary"
              onClick={() => onSubmitSelect(params.row)}
            />
          );
        }
        if (!isProcess && !isSubmit) {
          return (
            <V8CustomDropdownButton
              label={t("Edit")}
              variant="secondary"
              menuPosition="right"
              dropdownItems={dropdownItemsSafe}
              disabled={isDuplicating}
              onLabelClick={() => {
                if (typeof viewOrEditForm === "function") {
                  viewOrEditForm(params.row._id, "edit");
                } else if (typeof onDesignerEdit === "function") {
                  onDesignerEdit(params.row);
                }
              }}
            />
          );
        }
        return null;
      }
    });

    return base;
  }, [
    dispatch,
    isProcess,
    isSubmit,
    isBPMN,
    tenantKey,
    limit,
    pageNo,
    searchText,
    sortState,
    t,
    canProcessEdit,
    onProcessEdit,
    dropdownItemsSafe,
    isDuplicating,
    viewOrEditForm,
    onDesignerEdit,
  ]);

  // Rows mapping
  const rows = useMemo(() => {
    if (isProcess) {
      return (processList || []).map((p) => ({
        id: p.id || p.processKey,
        ...p,
      }));
    }
    return (forms || []).map((f) => ({
      id: isSubmit ? f._id : f._id || f.path || f.name,
      ...f,
    }));
  }, [forms, processList, isProcess, isSubmit]);

  // Sort model
  const activeKey = (sortState?.activeKey || (isProcess ? "name" : "formName"));
  const activeField = isProcess ? activeKey : (sortKeyToGridField[activeKey] || activeKey);
  const activeOrder = sortState?.[activeKey]?.sortOrder || "asc";
  const sortModel = useMemo(
    () => [{ field: activeField, sort: activeOrder }],
    [activeField, activeOrder]
  );

  const handleSortModelChange = (modelArray) => {
    const model = Array.isArray(modelArray) ? modelArray[0] : modelArray;
    if (isProcess) {
      if (!model?.field) return;
      const incomingField = model.field;
      const incomingOrder = model.sort || "asc";
      const currentActiveKey = sortState?.activeKey;
      const currentOrder = sortState?.[currentActiveKey]?.sortOrder || "asc";
      if (incomingField === currentActiveKey && incomingOrder === currentOrder) return;

      const nextSort = { activeKey: incomingField, [incomingField]: { sortOrder: incomingOrder } };
      // reset others to asc
      Object.keys(sortState || {}).forEach((key) => {
        if (key !== "activeKey" && key !== incomingField) {
          nextSort[key] = { sortOrder: "asc" };
        }
      });

      dispatch(isBPMN ? setBpmSort(nextSort) : setDmnSort(nextSort));
      return;
    }
    if (!model?.field || !model?.sort) {
      const isAlreadyDefault = activeKey === "formName" && (sortState?.formName?.sortOrder || "asc") === "asc";
      if (!isAlreadyDefault) {
        const resetSort = Object.keys(sortState || {}).reduce((acc, key) => {
          acc[key] = { sortOrder: "asc" };
          return acc;
        }, {});
        dispatch((isSubmit ? setClientFormListSort : setBpmFormSort)({ ...resetSort, activeKey: "formName" }));
      }
      return;
    }

    const incomingField = model.field;
    const incomingOrder = model.sort;
    const currentField = sortKeyToGridField[activeKey] || activeKey;
    const currentOrder = sortState?.[activeKey]?.sortOrder || "asc";
    if (incomingField === currentField && incomingOrder === currentOrder) return;

    const mappedKey = gridFieldToSortKey[incomingField] || incomingField;
    const updatedSort = Object.keys(sortState || {}).reduce((acc, columnKey) => {
      acc[columnKey] = { sortOrder: columnKey === mappedKey ? incomingOrder : "asc" };
      return acc;
    }, {});
    const sortAction = isSubmit ? setClientFormListSort : setBpmFormSort;
    dispatch(sortAction({ ...updatedSort, activeKey: mappedKey }));
  };

  // Pagination
  const paginationModel = useMemo(() => ({ page: pageNo - 1, pageSize: limit }), [pageNo, limit]);
  const onPaginationModelChange = useCallback(({ page, pageSize }) => {
    if (isProcess) {
      setProcessPaging((prev) => {
        const requestedPage = typeof page === "number" ? page + 1 : prev.pageNo;
        const requestedLimit = typeof pageSize === "number" ? pageSize : prev.limit;
        if (requestedPage === prev.pageNo && requestedLimit === prev.limit) return prev;
        return {
          pageNo: requestedLimit !== prev.limit ? 1 : requestedPage,
          limit: requestedLimit !== prev.limit ? requestedLimit : prev.limit,
        };
      });
      return;
    }

    const requestedPage = typeof page === "number" ? page + 1 : pageNo;
    const requestedLimit = typeof pageSize === "number" ? pageSize : limit;
    if (requestedPage === pageNo && requestedLimit === limit) return;

    batch(() => {
      if (requestedLimit !== limit) {
        dispatch((isSubmit ? setClientFormLimit : setBPMFormLimit)(requestedLimit));
        dispatch((isSubmit ? setClientFormListPage : setBPMFormListPage)(1));
      } else if (requestedPage !== pageNo) {
        dispatch((isSubmit ? setClientFormListPage : setBPMFormListPage)(requestedPage));
      }
    });
  }, [dispatch, isProcess, isSubmit, pageNo, limit]);

  // Apply column-resize disabling similar to ReusableTable
  const gridSx = useMemo(() => ({
    ...(disableColumnResize && {
      '& .MuiDataGrid-columnSeparator': {
        display: 'none !important',
      },
    }),
  }), [disableColumnResize]);

  return (
    <Paper sx={{ height: { sm: 400, md: 510, lg: 665 }, width: "100%" }}>
      <DataGrid
        columns={columns}
        rows={rows}
        rowCount={isProcess ? totalProcesses : totalForms}
        loading={isProcess ? isProcessLoading : searchFormLoading}
        slots={defaultSlots}
        slotProps={{
          loadingOverlay: {
            variant: 'skeleton',
            noRowsVariant: 'skeleton',
          },
        }}
        paginationMode="server"
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        getRowId={(row) => row.id}
        pageSizeOptions={[10, 25, 50, 100]}
        rowHeight={55}
        disableColumnMenu
        disableRowSelectionOnClick
        disableColumnResize={disableColumnResize}
        sx={gridSx}
      />
    </Paper>
  );
};

export default FormListGrid;


