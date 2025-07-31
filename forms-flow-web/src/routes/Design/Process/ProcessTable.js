import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  CustomButton,
  CustomSearch,
  ReusableProcessTableRow,
  TableFooter,
  NoDataFound,
  BuildModal,
  TableSkeleton
} from "@formsflow/components";
import { HelperServices } from '@formsflow/service';
import FilterSortActions from "../../../components/CustomComponents/FilterSortActions";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import SortableHeader from "../../../components/CustomComponents/SortableHeader";
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
const ProcessTable = React.memo(() => {
  const { viewType } = useParams();
  const isBPMN = viewType === "subflow";
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { createDesigns } = userRoles();
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
  const [showSortModal, setShowSortModal] = useState(false);
  const optionSortBy = [
    { value: "name", label: t("Name") },
    { value: "processKey", label: t("Id") },
    { value: "status", label: t("Status") },
    { value: "modified", label: t("Last Edited") },
  ];
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

  const handleFilterIconClick = () => {
    setShowSortModal(true);
  };

  const handleSortModalClose = () => {
    setShowSortModal(false);
  };
  const handleSortApply = (selectedSortOption, selectedSortOrder) => {
    setIsLoading(true);
    const action = isBPMN ? setBpmSort : setDmnSort;
    const resetSortOrders = HelperServices.getResetSortOrders(optionSortBy);
    dispatch(action({
      ...resetSortOrders,
      activeKey: selectedSortOption,
      [selectedSortOption]: { sortOrder: selectedSortOrder },
    }));

    setIsLoading(false);
    setShowSortModal(false);
  };


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

  const handleSort = (key) => {
    const newSortConfig = {
      activeKey: key,
      [key]: {
        sortOrder: sortConfig[key]?.sortOrder === "asc" ? "desc" : "asc",
      },
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

  const handleClearSearch = () => {
    if (isBPMN) {
      setSearchBPMN("");
      dispatch(setBpmnSearchText(""));
    } else {
      setSearchDMN("");
      dispatch(setDmnSearchText(""));
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
    setShowBuildModal(true);
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
      <div className="table-bar">
        <div className="filters">
          <CustomSearch
            search={search}
            setSearch={isBPMN ? setSearchBPMN : setSearchDMN}
            handleSearch={handleSearch}
            handleClearSearch={handleClearSearch}
            placeholder={t(`Search ${ProcessContents.processType} Name`)}
            searchLoading={searchLoading}
            title={t(`Search ${ProcessContents.processType} Name`)}
            dataTestId={`${ProcessContents.processType}-search-input`}
          />
        </div>
        <div className="actions">
          <FilterSortActions
            showSortModal={showSortModal}
            handleFilterIconClick={handleFilterIconClick}
            handleRefresh={handleRefresh}
            handleSortModalClose={handleSortModalClose}
            handleSortApply={handleSortApply}
            optionSortBy={optionSortBy}
            defaultSortOption={sortConfig.activeKey}
            defaultSortOrder={sortConfig[sortConfig.activeKey]?.sortOrder}
            filterDataTestId={ProcessContents.filterDataTestId}
            filterAriaLabel={ProcessContents.filterAriaLabel}
            refreshDataTestId={ProcessContents.refreshDataTestId}
            refreshAriaLabel={ProcessContents.refreshAriaLabel}
          />
          {createDesigns && (<CustomButton
            label={t(`New ${ProcessContents.processType}`)}
            onClick={handleCreateProcess}
            dataTestid={`create-${ProcessContents.processType}-button`}
            ariaLabel={` Create ${ProcessContents.processType}`}
            action
          />)}
        </div>
      </div>
      {isLoading ? <TableSkeleton columns={5} rows={10} /> :
        <div className="custom-table-wrapper-outter">
          <div className="custom-table-wrapper-inner">
            <table className="table custom-tables">
              <thead className="table-header">
                <tr>
                    <SortableHeader
                      columnKey="name"
                      title="Name"
                      currentSort={sortConfig}
                      handleSort={handleSort}
                      className="w-25"
                    />
                    <SortableHeader
                      columnKey="processKey"
                      title="ID"
                      currentSort={sortConfig}
                      handleSort={handleSort}
                      className="w-20"
                    />
                    <SortableHeader
                      columnKey="modified"
                      title="Last Edited"
                      currentSort={sortConfig}
                      handleSort={handleSort}
                      className="w-15"
                    />
                    <SortableHeader
                      columnKey="status"
                      title="Status"
                      currentSort={sortConfig}
                      handleSort={handleSort}
                      className="w-15"
                    />
                  <th
                    className="w-25"
                    colSpan="4"
                    aria-label="edit-button"
                  ></th>
                </tr>
              </thead>
              {processList.length ? (
                <>
                <tbody>
                  {processList.map((processItem) => (
                    <ReusableProcessTableRow
                      key={processItem.id}
                      item={processItem}
                      gotoEdit={gotoEdit}
                      buttonLabel={ProcessContents.processType}
                    />
                  ))}
                </tbody>
                </>
              ) : !isLoading ? (
                <tbody className="table-empty">
                  <NoDataFound message={t(`${ProcessContents.message}`)} />
                </tbody>
              ) : null}
            </table>
          </div>

          

          {processList.length ? (
            <TableFooter
                limit={currentState.limit}
                activePage={currentState.activePage}
                totalCount={totalCount}
                handlePageChange={handlePageChange}
                onLimitChange={onLimitChange}
                pageOptions={[
                  { text: "10", value: 10 },
                  { text: "25", value: 25 },
                  { text: "50", value: 50 },
                  { text: "100", value: 100 },
                  { text: "All", value: totalCount },
                ]}
              />
            ) : (
              <></>
            )}
        </div>
      }
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
