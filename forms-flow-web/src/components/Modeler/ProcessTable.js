import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  CustomButton,
  CustomSearch,
  ReusableProcessTableRow,
  TableFooter,
  NoDataFound,
  BuildModal,
} from "@formsflow/components";
import LoadingOverlay from "react-loading-overlay-ts";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import SortableHeader from "../CustomComponents/SortableHeader";
import { fetchAllProcesses } from "../../apiManager/services/processServices";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import { push } from "connected-react-router";
import ImportProcess from "../Modals/ImportProcess";
import {
  setBpmnSearchText,
  setDmnSearchText,
  setIsPublicDiagram,
} from "../../actions/processActions";

const ProcessTable = React.memo(() => {
  const { viewType } = useParams();
  const isBPMN = viewType === "subflow";
  const dispatch = useDispatch();
  const { t } = useTranslation();

  // States and selectors
  const processList = useSelector((state) =>
    isBPMN ? state.process.processList : state.process.dmnProcessList
  );
  const searchText = useSelector((state) =>
    isBPMN ? state.process.bpmnSearchText : state.process.dmnSearchText
  );
  const totalCount = useSelector((state) =>
    isBPMN ? state.process.totalBpmnCount : state.process.totalDmnCount
  );
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  
  //  local states for BPMN
  const [searchBPMN, setSearchBPMN] = useState(searchText || "");
  const [activePageBPMN, setActivePageBPMN] = useState(1);
  const [limitBPMN, setLimitBPMN] = useState(5);
  const [currentBpmnSort, setCurrentBpmnSort] = useState({
    activeKey: "name",
    name: { sortOrder: "asc" },
    processKey: { sortOrder: "asc" },
    modified: { sortOrder: "asc" },
    status: { sortOrder: "asc" },
  });
  //  local states for DMN
  const [searchDMN, setSearchDMN] = useState(searchText || "");
  const [activePageDMN, setActivePageDMN] = useState(1);
  const [limitDMN, setLimitDMN] = useState(5);
  const [currentDmnSort, setCurrentDmnSort] = useState({
    activeKey: "name",
    name: { sortOrder: "asc" },
    processKey: { sortOrder: "asc" },
    modified: { sortOrder: "asc" },
    status: { sortOrder: "asc" },
  });
  //viewtype specific states
  const search = isBPMN ? searchBPMN : searchDMN;
  const activePage = isBPMN ? activePageBPMN : activePageDMN;
  const limit = isBPMN ? limitBPMN : limitDMN;
  const currentSort = isBPMN ? currentBpmnSort : currentDmnSort;

  const [showBuildModal, setShowBuildModal] = useState(false);
  const [importProcess, setImportProcess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";

  //fetching bpmn or dmn
  useEffect(() => {
    setIsLoading(true);
    dispatch(
      fetchAllProcesses(
        {
          pageNo: activePage,
          tenant_key: tenantKey,
          processType: isBPMN ? "BPMN" : "DMN",
          limit,
          searchKey: search,
          sortBy: currentSort.activeKey,
          sortOrder: currentSort[currentSort.activeKey].sortOrder,
        },
        () => {
          setIsLoading(false);
          setSearchLoading(false);
        }
      )
    );
  }, [dispatch, activePage, limit, searchText, tenantKey, currentSort, isBPMN]);
  
  //Update api call when search field is empty
  useEffect(() => {
    if (!search.trim()) {
      dispatch(isBPMN ? setBpmnSearchText("") : setDmnSearchText(""));
    }
  }, [search, dispatch, isBPMN]);
  
  const handleSort = (key) => {
    const setSort = isBPMN ? setCurrentBpmnSort : setCurrentDmnSort;
  
    setSort((prevConfig) => ({
      ...prevConfig,
      activeKey: key,
      [key]: {
        sortOrder: prevConfig[key]?.sortOrder === "asc" ? "desc" : "asc",
      },
    }));
  };

  const handleSearch = () => {
    setSearchLoading(true);
    if (isBPMN) {
        setSearchBPMN(searchBPMN);
        dispatch(setBpmnSearchText(searchBPMN));
      } else {
        setSearchDMN(searchDMN);
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
    isBPMN ? setActivePageBPMN(page) : setActivePageDMN(page);
  };
  const onLimitChange = (newLimit) => {
    if (isBPMN) {
      setLimitBPMN(newLimit);
      setActivePageBPMN(1);
    } else {
      setLimitDMN(newLimit);
      setActivePageDMN(1);
    }
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

 //modal contents for importing BPMN or DMN
  const modalContents = [
    {
      id: 1,
      heading: "Build",
      body: `Create the ${isBPMN ? "BPMN" : "DMN"} from scratch`,
      onClick: () => dispatch(push(`${redirectUrl}${viewType}/create`)),
    },
    {
      id: 2,
      heading: "Import",
      body: `Upload ${isBPMN ? "BPMN" : "DMN"} from a file`,
      onClick: showImportModal,
    },
  ];
  

 
  return (
    <>
      <div className="d-md-flex justify-content-between align-items-center pb-3 flex-wrap">
        <div className="d-md-flex align-items-center p-0 search-box input-group input-group width-25">
          <CustomSearch
            search={search}
            setSearch={isBPMN ? setSearchBPMN : setSearchDMN}
            handleSearch={handleSearch}
            handleClearSearch={handleClearSearch}
            placeholder={t(`Search ${isBPMN ? "BPMN" : "Decision Table"}`)}
            searchLoading={searchLoading}
            title={t(`Search ${isBPMN ? "BPMN" : "DMN"} Name`)}
            dataTestId={`${isBPMN ? "BPMN" : "DMN"}-search-input`}
          />
        </div>
        <div className="d-md-flex justify-content-end align-items-center">
          <CustomButton
            variant="primary"
            size="sm"
            label={`New ${isBPMN ? "BPMN" : "DMN"}`}
            onClick={handleCreateProcess}
          />
        </div>
      </div>
      <LoadingOverlay active={isLoading} spinner text={t("Loading...")}>
        <div className="min-height-400 pt-3">
          <div className="custom-tables-wrapper">
            <table className="table custom-tables table-responsive-sm">
              <thead className="table-header">
                <tr>
                  <th className="w-25" scope="col">
                    <SortableHeader
                      columnKey="name"
                      title="Name"
                      currentSort={currentSort}
                      handleSort={handleSort}
                      className="ms-4"
                    />
                  </th>
                  <th className="w-20" scope="col">
                    <SortableHeader
                      columnKey="processKey"
                      title="ID"
                      currentSort={currentSort}
                      handleSort={handleSort}
                    />
                  </th>
                  <th className="w-15" scope="col">
                    <SortableHeader
                      columnKey="modified"
                      title="Last Edited"
                      currentSort={currentSort}
                      handleSort={handleSort}
                    />
                  </th>
                  <th className="w-15" scope="col">
                    <SortableHeader
                      columnKey="status"
                      title="Status"
                      currentSort={currentSort}
                      handleSort={handleSort}
                    />
                  </th>
                  <th className="w-25" colSpan="4" aria-label={`edit ${isBPMN ? "BPMN" : "DMN"} button`}></th>
                </tr>
              </thead>
              {processList.length ? (
                <tbody>
                  {processList.map((processItem) => (
                    <ReusableProcessTableRow
                      key={processItem.id}
                      item={processItem}
                      gotoEdit={gotoEdit}
                      buttonLabel={isBPMN ? "Bpmn" : "Dmn"}
                    />
                  ))}
                  <TableFooter
                    limit={limit}
                    activePage={activePage}
                    totalCount={totalCount}
                    handlePageChange={handlePageChange}
                    onLimitChange={onLimitChange}
                    pageOptions={[
                      { text: "5", value: 5 },
                      { text: "10", value: 10 },
                      { text: "25", value: 25 },
                      { text: "50", value: 50 },
                      { text: "100", value: 100 },
                      { text: "All", value: totalCount },
                    ]}
                  />
                </tbody>
              ) : !isLoading && <NoDataFound />}
            </table>
          </div>
        </div>
      </LoadingOverlay>
      <BuildModal
        show={showBuildModal}
        onClose={handleBuildModal}
        title={t(`New ${isBPMN ? "BPMN" : "DMN"}`)}
        contents={modalContents}
      />
      {importProcess && (
        <ImportProcess
          showModal={importProcess}
          closeImport={() => setImportProcess(false)}
          fileType={isBPMN ? ".bpmn" : ".dmn"}
        />
      )}
    </>
  );
});

export default ProcessTable;
