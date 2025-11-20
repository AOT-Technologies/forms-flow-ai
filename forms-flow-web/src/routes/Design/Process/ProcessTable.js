import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector, useDispatch, batch } from "react-redux";
import {
  CustomSearch,
  V8CustomButton,
  V8CustomDropdownButton,
  BuildModal,
  ReusableTable,
  Alert,
  AlertVariant,
  CustomProgressBar,
  useProgressBar
} from "@formsflow/components";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { fetchAllProcesses, getProcessDetails } from "../../../apiManager/services/processServices";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import { push } from "connected-react-router";
import ImportProcess from "../../../components/Modals/ImportProcess";
import {
  setBpmnSearchText,
  setDmnSearchText,
  setIsPublicDiagram,
  setBpmSort,
  setDmnSort,
  setProcessDiagramXML,
  setDescisionDiagramXML,
  setBpmnPage,
  setDmnPage,
  setBpmnLimit,
  setDmnLimit
} from "../../../actions/processActions";
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
  const processList = useSelector((state) =>
    isBPMN ? state.process.processList : state.process.dmnProcessList
  );
  const searchTextDMN = useSelector((state) => state.process.dmnSearchText);
  const searchTextBPMN = useSelector((state) => state.process.bpmnSearchText);
  const totalCount = useSelector((state) =>
    isBPMN ? state.process.totalBpmnCount : state.process.totalDmnCount
  );
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const sortConfig = useSelector((state) =>
    isBPMN ? state.process.bpmsort : state.process.dmnSort
  );
  const pageNo = useSelector((state) =>
    isBPMN ? state.process.bpmnPage : state.process.dmnPage
  );
  const limit = useSelector((state) =>
    isBPMN ? state.process.bpmnLimit : state.process.dmnLimit
  );
  const isProcessLoading = useSelector((state) => state.process.isProcessLoading);

  const [searchDMN, setSearchDMN] = useState(searchTextDMN || "");
  const [searchBPMN, setSearchBPMN] = useState(searchTextBPMN || "");
  const search = isBPMN ? searchBPMN : searchDMN;

  const [showBuildModal, setShowBuildModal] = useState(false);
  const [importProcess, setImportProcess] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  
  // Use progress bar hook for duplicate progress
  const { progress: duplicateProgress, start, complete, reset } = useProgressBar({
    increment: 5,
    interval: 150,
    useCap: true,
    capProgress: 90,
    initialProgress: 1,
  });

  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";

  // Extract primitive values from sortConfig for stable dependencies
  const sortBy = sortConfig.activeKey;
  const sortOrder = sortConfig[sortBy]?.sortOrder || "asc";
  // Use Redux search text for dependencies, not local state
  const reduxSearch = isBPMN ? searchTextBPMN : searchTextDMN;

  //fetching bpmn or dmn
  useEffect(() => {
    if (MULTITENANCY_ENABLED && !tenantKey) {
      return;
    }
    dispatch(
      fetchAllProcesses(
        {
          pageNo,
          tenant_key: tenantKey,
          processType: ProcessContents.processType,
          limit,
          searchKey: reduxSearch,
          sortBy,
          sortOrder,
        },
        () => {
          setSearchLoading(false);
        }
      )
    );
  }, [dispatch, pageNo, limit, tenantKey, reduxSearch, sortBy, sortOrder, isBPMN]);

  const handleRefresh = () => {
    dispatch(
      fetchAllProcesses(
        {
          pageNo,
          tenant_key: tenantKey,
          processType: ProcessContents.processType,
          limit,
          searchKey: reduxSearch,
          sortBy,
          sortOrder,
        },
        () => {
          setSearchLoading(false);
        }
      )
    );
  };

  //Update api call when search field is empty
  useEffect(() => {
    if (!search.trim()) {
      dispatch(isBPMN ? setBpmnSearchText("") : setDmnSearchText(""));
    }
  }, [search, dispatch, isBPMN]);

  const handleSort = useCallback((model) => {
    // DataGrid passes an array sort model; pick the first entry
    const next = Array.isArray(model) ? model[0] : model;
    if (!next || !next.field) {
      return;
    }
    const key = next.field;
    const requestedOrder = next.sort || "asc";

    const newSortConfig = {
      activeKey: key,
      [key]: { sortOrder: requestedOrder },
    };
    // Reset all other sort keys to default (ascending)
    Object.keys(sortConfig).forEach((sortKey) => {
      if (sortKey !== key && sortKey !== "activeKey") {
        newSortConfig[sortKey] = { sortOrder: "asc" };
      }
    });

    if (isBPMN) {
      dispatch(setBpmSort(newSortConfig));
    } else {
      dispatch(setDmnSort(newSortConfig));
    }
  }, [dispatch, isBPMN, sortConfig]);
  const handleSearch = () => {
    setSearchLoading(true);
    batch(() => {
      if (isBPMN) {
        dispatch(setBpmnSearchText(searchBPMN));
        dispatch(setBpmnPage(1));
      } else {
        dispatch(setDmnSearchText(searchDMN));
        dispatch(setDmnPage(1));
      }
    });
  };

  const handlePageChange = useCallback((page) => {
    if (isBPMN) {
      dispatch(setBpmnPage(page));
    } else {
      dispatch(setDmnPage(page));
    }
  }, [dispatch, isBPMN]);

  const handleLimitChange = useCallback((limitVal) => {
    batch(() => {
      if (isBPMN) {
        dispatch(setBpmnLimit(limitVal));
        dispatch(setBpmnPage(1));
      } else {
        dispatch(setDmnLimit(limitVal));
        dispatch(setDmnPage(1));
      }
    });
  }, [dispatch, isBPMN]);

  const gotoEdit = (data) => {
    if (MULTITENANCY_ENABLED) {
      dispatch(setIsPublicDiagram(!!data.tenantId));
    }
    dispatch(
      push(
        `${redirectUrl}${viewType}/edit/${data.processKey}`
      )
    );
  };

  const handleDuplicate = async (row) => {
    try {
      setIsDuplicating(true);
      reset();
      
      // Start progress simulation
      start();
      
      // Fetch process details to get the processData
      const response = await getProcessDetails({
        processKey: row.processKey,
        tenant_key: tenantKey
      });
      
      // Set the diagram XML to Redux based on process type
      if (isBPMN) {
        dispatch(setProcessDiagramXML(response.data.processData));
      } else {
        dispatch(setDescisionDiagramXML(response.data.processData));
      }
      
      // Complete progress
      complete();
      
      // Wait a bit before redirecting to show completion
      setTimeout(() => {
        // Navigate to create route only after progress reaches 100
        dispatch(push(`${redirectUrl}${viewType}/create`));
      }, 500);
    } catch (error) {
      console.error("Error duplicating process:", error);
      // Complete progress on error
      complete();
      // Wait a bit before hiding the alert to show completion/error
      setTimeout(() => {
        setIsDuplicating(false);
        reset();
      }, 3000);
    }
  };

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

  const columns = [
    {
      field: "name",
      headerName: t("Name"),
      flex: 1,
      sortable: true,
      width: 180,
      height: 55,
      renderCell: (params) => (
        <span title={params.value}>
          {params.value}
        </span>
      ),
    },
    {
      field: "processKey",
      headerName: t("ID"),
      flex: 1,
      sortable: true,
      width: 180,
      height: 55,
      renderCell: (params) => (
        <span title={params.value}>
          {params.value}
        </span>
      ),
    },
    {
      field: "modified",
      headerName: t("Last Edited"),
      flex: 1,
      sortable: true,
      width: 180,
      height: 55,
      renderCell: params => {
        const dateValue = HelperServices.getLocaldate(params.row.modified);
        return (
          <span title={dateValue}>
            {dateValue}
          </span>
        );
      },
    },
    {
      field: "status",
      headerName: t("Status"),
      flex: 1,
      sortable: true,
      width: 180,
      height: 55,
      renderCell: params => {
        const statusText = params.row.status === "Published" ? t("Published") : t("Unpublished");
        return (
          <span className="d-flex align-items-center">
            {params.row.status === "Published" ?
              <span className="status-live"></span> :
              <span className="status-draft"></span>}
            <span title={statusText}>
              {statusText}
            </span>
          </span>
        );
      },
    },
    {
      field: "actions",
      renderHeader: () => (
        <V8CustomButton
          // label="new button"
          variant="secondary"
          label={t("Refresh")}
          onClick={handleRefresh}
        />
      ),
      flex: 1,
      sortable: false,
      cellClassName: "last-column",
      renderCell: params => (
        (createDesigns || manageAdvancedWorkFlows) && (
          <V8CustomDropdownButton
          label={t("Edit")}
          variant="secondary"
          menuPosition="right"
          dropdownItems={[
            {
              label: t(`Duplicate ${ProcessContents.processType}`),
              onClick: () => handleDuplicate(params.row),
            },
          ]}
          onLabelClick= {() => gotoEdit(params.row)}
        />
        )
      )
    },
  ];
  const paginationModel = useMemo(
    () => ({ page: pageNo - 1, pageSize: limit }),
    [pageNo, limit]
  );

  const sortModel = useMemo(
    () => [
      {
        field: sortConfig.activeKey,
        sort: sortConfig[sortConfig.activeKey]?.sortOrder || "asc",
      },
    ],
    [sortConfig]
  );

  const onPaginationModelChange = useCallback(({ page, pageSize }) => {
    const requestedPage = (typeof page === "number" ? page : 0) + 1;
    
    if (limit !== pageSize) {
      handleLimitChange(pageSize);
    } else {
      handlePageChange(requestedPage);
    }
  }, [limit, handleLimitChange, handlePageChange]);
  return (
    <>
      <div className="toast-section">
        <Alert
          message={t(`Duplicating the ${ProcessContents.processType}`)}
          variant={AlertVariant.FOCUS}
          isShowing={isDuplicating}
          rightContent={<CustomProgressBar progress={duplicateProgress} />}
        />
      </div>
      <div className="header-section-1">
        <div className="section-seperation-left">
          <h4> Build</h4>
        </div>
        <div className="section-seperation-right">
          {(createDesigns || manageAdvancedWorkFlows) && (
            <V8CustomButton
              variant="primary"
              label={t(`Create new ${ProcessContents.processType}`)}
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
      <div className="body-section">
      <ReusableTable
        columns={columns}
        rows={processList}
        rowCount={totalCount}
        loading={searchLoading || isProcessLoading}
        sortModel={sortModel}
        onSortModelChange={handleSort}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        getRowId={(row) => row.id}
        autoHeight={true}
      />
      </div>
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
