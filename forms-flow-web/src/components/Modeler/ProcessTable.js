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
  const ProcessContents = isBPMN
    ? {
        processType: "BPMN",
        extension: ".bpmn",
      }
    : {   
        processType: "DMN",
        extension: ".dmn",
      };

  // States and selectors
  const processList = useSelector((state) =>
    isBPMN ? state.process.processList : state.process.dmnProcessList
  );
  const searchTextDMN = useSelector((state) => state.process.dmnSearchText);
  const searchTextBPMN = useSelector((state)=> state.process.bpmnSearchText);
  const totalCount = useSelector((state) =>
    isBPMN ? state.process.totalBpmnCount : state.process.totalDmnCount
  );
  const tenantKey = useSelector((state) => state.tenants?.tenantId);

  const initialSortConfig = {
    activeKey: "name",
    name: { sortOrder: "asc" },
    processKey: { sortOrder: "asc" },
    modified: { sortOrder: "asc" },
    status: { sortOrder: "asc" },
  };

  const [bpmnState, setBpmnState] = useState({
    activePage: 1,
    limit: 5,
    sortConfig: initialSortConfig,
  });

  const [dmnState, setDmnState] = useState({
    activePage: 1,
    limit: 5,
    sortConfig: initialSortConfig,
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

   //fetching bpmn or dmn
   useEffect(() => {
    setIsLoading(true);
    dispatch(
      fetchAllProcesses(
        {
            pageNo: currentState.activePage,
            tenant_key: tenantKey,
            processType: ProcessContents.processType,
            limit: currentState.limit,
            searchKey: search,
            sortBy: currentState.sortConfig.activeKey,
            sortOrder: currentState.sortConfig[currentState.sortConfig.activeKey].sortOrder,
        },
        () => {
          setIsLoading(false);
          setSearchLoading(false);
        }
      )
    );
  }, [dispatch, currentState, tenantKey,searchTextBPMN,searchTextDMN, isBPMN]);
 
  //Update api call when search field is empty
  useEffect(() => {
    if (!search.trim()) {
      dispatch(isBPMN ? setBpmnSearchText("") : setDmnSearchText(""));
    }
  }, [search, dispatch, isBPMN]);

  const handleSort = (key) => {
    setCurrentState((prevState) => ({
      ...prevState,
      sortConfig: {
        ...prevState.sortConfig,
        activeKey: key,
        [key]: {
          sortOrder: prevState.sortConfig[key]?.sortOrder === "asc" ? "desc" : "asc",
        },
      },
    }));
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
      <div className="d-md-flex justify-content-between align-items-center pb-3 flex-wrap">
        <div className="d-md-flex align-items-center p-0 search-box input-group input-group width-25">
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
        <div className="d-md-flex justify-content-end align-items-center">
          <CustomButton
            variant="primary"
            size="sm"
            label={t(`New ${ProcessContents.processType}`)}
            onClick={handleCreateProcess}
            dataTestid={`create-${ProcessContents.processType}-button`}
            ariaLabel={` Create ${ProcessContents.processType}`}
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
                      currentSort={currentState.sortConfig}
                      handleSort={handleSort}
                      className="gap-2"
                    />
                  </th>
                  <th className="w-20" scope="col">
                    <SortableHeader
                      columnKey="processKey"
                      title="ID"
                      currentSort={currentState.sortConfig}
                      handleSort={handleSort}
                      className="gap-2"
                    />
                  </th>
                  <th className="w-15" scope="col">
                    <SortableHeader
                      columnKey="modified"
                      title="Last Edited"
                      currentSort={currentState.sortConfig}
                      handleSort={handleSort}
                      className="gap-2"
                    />
                  </th>
                  <th className="w-15" scope="col">
                    <SortableHeader
                      columnKey="status"
                      title="Status"
                      currentSort={currentState.sortConfig}
                      handleSort={handleSort}
                      className="gap-2"
                    />
                  </th>
                  <th className="w-25" colSpan="4" aria-label="edit-button"></th>
                </tr>
              </thead>
              {processList.length ? (
                <tbody>
                  {processList.map((processItem) => (
                    <ReusableProcessTableRow
                      key={processItem.id}
                      item={processItem}
                      gotoEdit={gotoEdit}
                      buttonLabel={ProcessContents.processType}
                    />
                  ))}
                  <TableFooter
                    limit={currentState.limit}
                    activePage={currentState.activePage}
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
