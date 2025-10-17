import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  CustomSearch,
  V8CustomButton,
  V8CustomDropdownButton,
  BuildModal,
  RefreshIcon,
  NewSortDownIcon,

} from "@formsflow/components";
import { useTranslation } from "react-i18next";
import { DataGrid } from '@mui/x-data-grid';
import Paper from "@mui/material/Paper";
import { useParams } from "react-router-dom";
import { fetchAllProcesses } from "../../../apiManager/services/processServices";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import { push } from "connected-react-router";
import ImportProcess from "../../../components/Modals/ImportProcess";
import {
  setBpmnSearchText,
  setDmnSearchText,
  setIsPublicDiagram,
  setBpmSort,
  setDmnSort
} from "../../../actions/processActions";
import userRoles from "../../../constants/permissions";
import { HelperServices,StyleServices } from "@formsflow/service";
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
  const iconColor = StyleServices.getCSSVariable('--ff-gray-medium-dark');
  const totalCount = useSelector((state) =>
    isBPMN ? state.process.totalBpmnCount : state.process.totalDmnCount
  );
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const sortConfig = useSelector((state) =>
    isBPMN ? state.process.bpmsort : state.process.dmnSort
  );
  
  const [bpmnState, setBpmnState] = useState({
    activePage: 1,
    limit: 10,
    sortConfig: sortConfig,
  });

  const [dmnState, setDmnState] = useState({
    activePage: 1,
    limit: 10,
    sortConfig: sortConfig,
  });
  const [searchDMN, setSearchDMN] = useState(searchTextDMN || "");
  const [searchBPMN, setSearchBPMN] = useState(searchTextBPMN || "");
  const search = isBPMN ? searchBPMN : searchDMN;

  const [showBuildModal, setShowBuildModal] = useState(false);
  const [importProcess, setImportProcess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  const currentState = isBPMN ? bpmnState : dmnState;
  const setCurrentState = isBPMN ? setBpmnState : setDmnState;

  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  
  const fetchProcesses = () => {
    setIsLoading(true);
    dispatch(
      fetchAllProcesses(
        {
          pageNo: currentState.activePage,
          tenant_key: tenantKey,
          processType: ProcessContents.processType,
          limit: currentState.limit,
          searchKey: search,
          sortBy: sortConfig.activeKey,
          sortOrder: sortConfig[sortConfig.activeKey].sortOrder,
        },
        () => {
          setIsLoading(false);
          setSearchLoading(false);
        }
      )
    );
  };

 
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


  const handleRefresh = () => {
    fetchProcesses();
  };

  //fetching bpmn or dmn
  useEffect(() => {
    fetchProcesses();
  }, [dispatch, currentState, tenantKey, searchTextBPMN, searchTextDMN, isBPMN, sortConfig]);

  //Update api call when search field is empty
  useEffect(() => {
    if (!search.trim()) {
      dispatch(isBPMN ? setBpmnSearchText("") : setDmnSearchText(""));
    }
  }, [search, dispatch, isBPMN]);

  const handleSort = (model) => {
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
  };
  const handleSearch = () => {
    setSearchLoading(true);
    if (isBPMN) {
      dispatch(setBpmnSearchText(searchBPMN));
    } else {
      dispatch(setDmnSearchText(searchDMN));
    }
    handlePageChange(1);
  };


  const handlePageChange = (page) => {
    setCurrentState((prevState) => ({
      ...prevState,
      activePage: page,
    }));
  };

  const onLimitChange = (newLimit) => {
    setCurrentState((prevState) => ({
      ...prevState,
      limit: newLimit,
      activePage: 1,
    }));
  };

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
    },
    {
      field: "processKey",
      headerName: t("ID"),
      flex: 1,
      sortable: true,
      width: 180,
      height: 55,
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
        (createDesigns || manageAdvancedWorkFlows) && (
          <V8CustomDropdownButton
          label={t("Edit")}
          variant="secondary"
          menuPosition="right"
          dropdownItems={[]}
          onLabelClick= {() => gotoEdit(params.row)}
        />
        )
      )
    },
  ];
  const paginationModel = React.useMemo(
    () => ({ page: currentState.activePage - 1, pageSize: currentState.limit }),
    [currentState.activePage, currentState.limit]
  );
  const onPaginationModelChange = ({ page, pageSize }) => {
    if (currentState.limit !== pageSize) {
      onLimitChange(pageSize);
    } else if (currentState.activePage - 1 !== page) {
      handlePageChange(page + 1);
    }
  };
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
          />
        </div>
      </div>
      <Paper sx={{ height: { sm: 400, md: 510, lg: 510 }, width: "100%" }}>
        <DataGrid
          disableColumnResize // disabed resizing
          columns={columns}
          rows={processList}
          rowCount={totalCount}
          loading={searchLoading || isLoading}
          paginationMode="server"
          sortingMode="server"
          disableColumnMenu
          sortModel={[
            {
              field: sortConfig.activeKey,
              sort: sortConfig[sortConfig.activeKey].sortOrder,
            },
          ]}
          onSortModelChange={handleSort}
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
              variant: "skeleton",
              noRowsVariant: "skeleton",
            },
          }}
        />
      </Paper>

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
