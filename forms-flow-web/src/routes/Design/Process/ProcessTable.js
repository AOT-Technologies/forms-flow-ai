import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CustomSearch, V8CustomButton, BuildModal } from "@formsflow/components";
import { WrappedTable } from "@formsflow/components";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import { push } from "connected-react-router";
import ImportProcess from "../../../components/Modals/ImportProcess";
import { setBpmnSearchText, setDmnSearchText, setIsPublicDiagram, setBpmSort, setDmnSort } from "../../../actions/processActions";
import { fetchAllProcesses } from "../../../apiManager/services/processServices";
import userRoles from "../../../constants/permissions";
import { HelperServices } from "@formsflow/service";
import {
  navigateToSubflowBuild,
  navigateToDecisionTableBuild,
} from "../../../helper/routerHelper";


const ProcessTable = React.memo(() => {
  const { viewType } = useParams();
  const isBPMN = viewType === "subflow";
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { createDesigns, manageAdvancedWorkFlows } = userRoles();
  const ProcessContents = isBPMN
    ? {
      processType: "BPMN",
      extension: ".bpmn",
      filterDataTestId: "Process-list-filter-bpmn",
      filterAriaLabel: "Filter the Process list (BPMN)",
      refreshDataTestId: "Process-list-refresh-bpmn",
      refreshAriaLabel: "Refresh the Process list (BPMN)",
      message: "No subflows have been found. Create a new subflow by clicking \"New BPMN\" button in the top right."
    }
    : {
      processType: "DMN",
      extension: ".dmn",
      filterDataTestId: "Process-list-filter-dmn",
      filterAriaLabel: "Filter the Process list (DMN)",
      refreshDataTestId: "Process-list-refresh-dmn",
      refreshAriaLabel: "Refresh the Process list (DMN)",
      message: "No decision tables have been found. Create a new decision table by clicking \"New DMN\" button in the top right."
    };

  // States and selectors
  const searchTextDMN = useSelector((state) => state.process.dmnSearchText);
  const searchTextBPMN = useSelector((state) => state.process.bpmnSearchText);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const sortConfig = useSelector((state) =>
    isBPMN ? state.process.bpmsort : state.process.dmnSort
  );
  const processList = useSelector((state) =>
    isBPMN ? state.process.processList : state.process.dmnProcessList
  );
  const totalCount = useSelector((state) =>
    isBPMN ? state.process.totalBpmnCount : state.process.totalDmnCount
  );
  
  const [searchDMN, setSearchDMN] = useState(searchTextDMN || "");
  const [searchBPMN, setSearchBPMN] = useState(searchTextBPMN || "");
  const search = isBPMN ? searchBPMN : searchDMN;
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [importProcess, setImportProcess] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);

  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";


  // const handleSortApply = (selectedSortOption, selectedSortOrder) => {
  //   setIsLoading(true);
  //   const action = isBPMN ? setBpmSort : setDmnSort;
  //   const resetSortOrders = HelperServices.getResetSortOrders(optionSortBy);
  //   dispatch(action({
  //     ...resetSortOrders,
  //     activeKey: selectedSortOption,
  //     [selectedSortOption]: { sortOrder: selectedSortOrder },
  //   }));

  //   setIsLoading(false);
  // };


  // const handleRefresh = () => {};

  // fetching handled by WrappedTable

  //Update api call when search field is empty
  useEffect(() => {
    if (!search.trim()) {
      dispatch(isBPMN ? setBpmnSearchText("") : setDmnSearchText(""));
    }
  }, [search, dispatch, isBPMN]);

  // const handleSort = () => {};
  const handleSearch = () => {
    setSearchLoading(true);
    if (isBPMN) {
      dispatch(setBpmnSearchText(searchBPMN));
    } else {
      dispatch(setDmnSearchText(searchDMN));
    }
    // WrappedTable will handle resetting pagination
  };


  // Data fetching
  const fetchProcesses = useCallback(() => {
    setSearchLoading(true);
    dispatch(
      fetchAllProcesses(
        {
          pageNo,
          tenant_key: tenantKey,
          processType: ProcessContents.processType,
          limit,
          searchKey: search,
          sortBy: sortConfig.activeKey,
          sortOrder: sortConfig[sortConfig.activeKey].sortOrder,
        },
        () => setSearchLoading(false)
      )
    );
  }, [
    dispatch,
    pageNo,
    limit,
    sortConfig,
    search,
    tenantKey,
    ProcessContents.processType,
  ]);

  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  const gotoEdit = useCallback((data) => {
    if (MULTITENANCY_ENABLED) {
      dispatch(setIsPublicDiagram(!!data.tenantId));
    }
    dispatch(
      push(
        `${redirectUrl}${viewType}/edit/${data.processKey}`
      )
    );
  }, [dispatch, redirectUrl, viewType]);

  // Column definitions
  const columns = useMemo(() => [
    {
      field: "name",
      headerName: t("Name"),
      flex: 1,
      sortable: true,
      renderCell: (p) => <span title={p.value}>{p.value}</span>,
    },
    {
      field: "processKey",
      headerName: t("ID"),
      flex: 1,
      sortable: true,
      renderCell: (p) => <span title={p.value}>{p.value}</span>,
    },
    {
      field: "modified",
      headerName: t("Last Edited"),
      flex: 1,
      sortable: true,
      renderCell: (p) => (
        <span title={HelperServices.getLocaldate(p.row.modified)}>
          {HelperServices.getLocaldate(p.row.modified)}
        </span>
      ),
    },
    {
      field: "status",
      headerName: t("Status"),
      flex: 1,
      sortable: true,
      renderCell: (p) => (
        <span className="d-flex align-items-center">
          {p.row.status === "Published" ? (
            <span className="status-live"></span>
          ) : (
            <span className="status-draft"></span>
          )}
          {p.row.status === "Published" ? t("Live") : t("Draft")}
        </span>
      ),
    },
    {
      field: "actions",
      align: "right",
      flex: 1,
      sortable: false,
      cellClassName: "last-column",
      renderCell: (params) => {
        if (createDesigns || manageAdvancedWorkFlows) {
          return (
            <V8CustomButton
              label={t("Edit")}
              variant="secondary"
              onClick={() => gotoEdit(params.row)}
            />
          );
        }
        return null;
      },
    },
  ], [t, createDesigns, manageAdvancedWorkFlows, gotoEdit]);

  // Rows mapping
  const rows = useMemo(() => (
    (processList || []).map((p) => ({ id: p.id || p.processKey, ...p }))
  ), [processList]);

  // Sort model
  const sortModel = useMemo(() => [{
    field: sortConfig.activeKey,
    sort: sortConfig[sortConfig.activeKey].sortOrder,
  }], [sortConfig]);

  // Sort handler
  const handleSortModelChange = useCallback((modelArray) => {
    const model = Array.isArray(modelArray) ? modelArray[0] : modelArray;
    if (!model?.field) return;
    const next = {
      activeKey: model.field,
      [model.field]: { sortOrder: model.sort || "asc" },
    };
    if (isBPMN) {
      dispatch(setBpmSort(next));
    } else {
      dispatch(setDmnSort(next));
    }
  }, [dispatch, isBPMN]);

  // Pagination model
  const paginationModel = useMemo(() => (
    { page: pageNo - 1, pageSize: limit }
  ), [pageNo, limit]);

  // Pagination handler
  const onPaginationModelChange = useCallback(({ page, pageSize }) => {
    const nextPage = typeof page === "number" ? page + 1 : pageNo;
    const nextLimit = typeof pageSize === "number" ? pageSize : limit;
    if (nextLimit !== limit) {
      setLimit(nextLimit);
      setPageNo(1);
    } else if (nextPage !== pageNo) {
      setPageNo(nextPage);
    }
  }, [pageNo, limit]);

  const handleCreateProcess = () => {
    if (isBPMN) {
      navigateToSubflowBuild(dispatch, tenantKey);
    } else {
      navigateToDecisionTableBuild(dispatch, tenantKey);
    }
  };

  const handleBuildModal = () => {
    setShowBuildModal(false);
  };

  const showImportModal = () => {
    setShowBuildModal(false);
    setImportProcess(true);
  };

  // contents for import of  BPMN or DMN
  const modalContents = [
    {
      id: 1,
      heading: t("Build"),
      body: t(`Create the ${ProcessContents.processType} from scratch`),
      onClick: () => dispatch(push(`${redirectUrl}${viewType}/create`)),
    },
    {
      id: 2,
      heading: t("Import"),
      body: t(`Upload ${ProcessContents.processType} from a file`),
      onClick: showImportModal,
    },
  ];

  return (
    <>
      <div className="toast-section">{/* <p>Toast message</p> */}</div>
      <div className="header-section-1">
        <div className="section-seperation-left">
          <h4> Build</h4>
        </div>
        <div className="section-seperation-right">
          {(createDesigns || manageAdvancedWorkFlows) && (
            <V8CustomButton
              variant="primary"
              label={t(`New ${ProcessContents.processType}`)}
              onClick={handleCreateProcess}
              dataTestid={`create-${ProcessContents.processType}-button`}
              ariaLabel={` Create ${ProcessContents.processType}`}
            />
          )}
        </div>
      </div>
      <div className="header-section-2">
        <div className="section-seperation-left">
          <CustomSearch
            search={search}
            setSearch={isBPMN ? setSearchBPMN : setSearchDMN}
            handleSearch={handleSearch}
            placeholder={t(`Search ${ProcessContents.processType} Name`)}
            searchLoading={searchLoading}
            title={t(`Search ${ProcessContents.processType} Name`)}
            dataTestId={`${ProcessContents.processType}-search-input`}
            width="462px"
          />
        </div>
      </div>
      <WrappedTable
        columns={columns}
        rows={rows}
        rowCount={totalCount}
        loading={searchLoading}
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        getRowId={(row) => row.id}
        onRefresh={fetchProcesses}
      />

      <BuildModal
        show={showBuildModal}
        onClose={handleBuildModal}
        title={t(`New ${ProcessContents.processType}`)}
        contents={modalContents}
      />
      {importProcess && (
        <ImportProcess
          showModal={importProcess}
          closeImport={() => setImportProcess(false)}
          fileType={ProcessContents.extension}
        />
      )}
    </>
  );
});

export default ProcessTable;
