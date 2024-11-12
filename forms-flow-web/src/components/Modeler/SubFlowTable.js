import React, { useEffect, useState } from "react";
import {
  CustomButton,
  CustomSearch,
  TableFooter,
  ReusableProcessTableRow,
  BuildModal,
} from "@formsflow/components";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import { fetchAllProcesses } from "../../apiManager/services/processServices";
import LoadingOverlay from "react-loading-overlay-ts";
import {
  setBpmnSearchText,
  setIsPublicDiagram,
} from "../../actions/processActions";
import { push } from "connected-react-router";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import SortableHeader from "../CustomComponents/SortableHeader";
import ImportSubflowTable from "../Modals/ImportSubFlow";


const SubFlow = React.memo(() => {
  const searchText = useSelector((state) => state.process.bpmnSearchText);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const [limit, setLimit] = useState(5);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [activePage, setActivePage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const process = useSelector((state) => state.process.processList);
  const totalCount = useSelector((state) => state.process.totalBpmnCount);
  const [search, setSearch] = useState(searchText || "");
  const [searchSubflowLoading, setSearchSubflowLoading] = useState(false);
  const [currentBpmnSort, setCurrentBpmnSort] = useState({
    activeKey: "name",
    name: { sortOrder: "asc" },
    processKey: { sortOrder: "asc" },
    modified: { sortOrder: "asc" },
    status: { sortOrder: "asc" },
  });
  const [importSubflow, setImportSubflow] = useState(false);
  const closeBpmnImport = () => {
    setImportSubflow(false);
  };
  const [importSubflow, setImportSubflow] = useState(false);
  const closeBpmnImport = () => {
    setImportSubflow(false);
  };
  const [showBuildModal, setShowBuildModal] = useState(false);
  const handleBuildClick = () => {
    dispatch(
      push(`${redirectUrl}subflow/create`));
  };


  const handleImportClick = () => {
    setShowBuildModal(false);
    setImportSubflow(true);
    setShowBuildModal(false);
    setImportSubflow(true);
  };
  const contents = [
    {
    {
      id: 1,
      heading: "Build",
      heading: "Build",
      body: "Create the BPMN from scratch",
      onClick: handleBuildClick
    },
    {
    {
      id: 2,
      heading: "Import",
      heading: "Import",
      body: "Upload BPMN from a file",
      onClick: handleImportClick
    }
  ];

  useEffect(() => {
    if (!search?.trim()) {
      dispatch(setBpmnSearchText(""));
    }
  }, [search]);

  useEffect(() => {
    setIsLoading(true);
    dispatch(
      fetchAllProcesses(
        {
          pageNo: activePage,
          tenant_key: tenantKey,
          processType: "BPMN",
          limit: limit,
          searchKey: search,
          sortBy: currentBpmnSort.activeKey,
          sortOrder: currentBpmnSort[currentBpmnSort.activeKey].sortOrder,
        },
        () => {
          setIsLoading(false);
          setSearchSubflowLoading(false);
        }
      )
    );
  }, [dispatch, activePage, limit, searchText, currentBpmnSort]);

  const handleSort = (key) => {
    setCurrentBpmnSort((prevSort) => {
      const newSortOrder = prevSort[key].sortOrder === "asc" ? "desc" : "asc";
      return {
        ...prevSort,
        activeKey: key,
        [key]: { sortOrder: newSortOrder },
      };
    });
  };

  const pageOptions = [
    { text: "5", value: 5 },
    { text: "25", value: 25 },
    { text: "50", value: 50 },
    { text: "100", value: 100 },
    { text: "All", value: totalCount },
  ];

  const handlePageChange = (page) => setActivePage(page);
  const onLimitChange = (newLimit) => {
    setLimit(newLimit);
    setActivePage(1);
  };
  const handleClearSearch = () => {
    setSearch("");
    setActivePage(1);
    dispatch(setBpmnSearchText(""));
  };
  const handleSearch = () => {
    setSearchSubflowLoading(true);
    setActivePage(1);
    dispatch(setBpmnSearchText(search));
  };

  const gotoEdit = (data) => {
    if (MULTITENANCY_ENABLED) {
      dispatch(setIsPublicDiagram(!!data.tenantId));
    }
    dispatch(push(`${redirectUrl}subflow/edit/${data.processKey}`));
  };

  const handleCreateBPMN = () => {
    setShowBuildModal(true);
  };
  const handleBuildModal = () => {
    setShowBuildModal(false);
  };

  return (
    <>
      <div className="d-md-flex justify-content-between align-items-center pb-3 flex-wrap">
        <div className="d-md-flex align-items-center p-0 search-box input-group input-group width-25">
          <CustomSearch
            search={search}
            setSearch={setSearch}
            handleSearch={handleSearch}
            handleClearSearch={handleClearSearch}
            placeholder={t("Search BPMN Name")}
            searchLoading={searchSubflowLoading}
            title={t("Search BPMN Name")}
            dataTestId="BPMN-search-input"
          />
        </div>
        <div className="d-md-flex justify-content-end align-items-center ">
          <CustomButton
            variant="primary"
            size="sm"
            label="New BPMN"
            className=""
            dataTestid="create-BPMN-button"
            ariaLabel="Create BPMN"
            onClick={() => handleCreateBPMN()}
          />
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
                        currentSort={currentBpmnSort}
                        handleSort={handleSort}
                        className="ms-4"
                      />
                    </th>
                    <th className="w-20" scope="col">
                      <SortableHeader
                        columnKey="id"
                        title="id"
                        currentSort={currentBpmnSort}
                        handleSort={handleSort}
                      />
                    </th>
                    <th className="w-15" scope="col">
                      <SortableHeader
                        columnKey="modified"
                        title="Last Edited"
                        currentSort={currentBpmnSort}
                        handleSort={handleSort}
                      />
                    </th>
                    <th className="w-15" scope="col">
                      <SortableHeader
                        columnKey="status"
                        title="Status"
                        currentSort={currentBpmnSort}
                        handleSort={handleSort}
                      />
                    </th>
                    <th
                      className="w-25"
                      colSpan="4"
                      aria-label="edit bpmn button "
                    ></th>
                  </tr>
                </thead>
                <tbody>
                  {process.map((processItem) => (
                    <ReusableProcessTableRow
                      key={processItem.id}
                      item={processItem}
                      gotoEdit={gotoEdit}
                      buttonLabel="Bpmn"
                    />
                  ))}
                  <TableFooter
                    limit={limit}
                    activePage={activePage}
                    totalCount={totalCount}
                    handlePageChange={handlePageChange}
                    onLimitChange={onLimitChange}
                    pageOptions={pageOptions}
                  />
                </tbody>
              </table>
            </div>
          </div>
        </LoadingOverlay>
      </div>
      <BuildModal
        show={showBuildModal}
        onClose={handleBuildModal}
        title={t(`New BPMN`)}
        contents={contents}/>
      {importSubflow && <ImportSubflowTable
        showModal={importSubflow}
        closeImport={closeBpmnImport}
      />}
    </>
  );
});

export default SubFlow;
