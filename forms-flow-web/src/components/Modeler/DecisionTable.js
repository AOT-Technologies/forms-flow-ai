import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CustomButton, CustomSearch } from "@formsflow/components";
import LoadingOverlay from "react-loading-overlay-ts";
import { useTranslation } from "react-i18next";
import SortableHeader from "../CustomComponents/SortableHeader";
import {
  ReusableTableRow,
  TableFooter,
} from "../CustomComponents/TableComponents";
import { fetchAllProcesses } from "../../apiManager/services/processServices";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import { push } from "connected-react-router";
import {
  setDmnSearchText,
  setIsPublicDiagram,
} from "../../actions/processActions";

const DecisionTable = React.memo(() => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const dmn = useSelector((state) => state.process?.dmnProcessList);
  const [isLoading, setIsLoading] = useState(true);
  const searchText = useSelector((state) => state.process?.dmnSearchText);
  const [activePage, setActivePage] = useState(1);
  const [limit, setLimit] = useState(5);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const totalCount = useSelector((state) => state.process.totalDmnCount);
  const [currentDmnSort, setCurrentDmnSort] = useState({
    activeKey: "name",
    name: { sortOrder: "asc" },
    id: { sortOrder: "asc" },
    modified: { sortOrder: "asc" },
    status: { sortOrder: "asc" },
  });
  const [searchDmnLoading, setSearchDmnLoading] = useState(false);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const [search, setSearch] = useState(searchText || "");

  useEffect(() => {
    setIsLoading(true);
    dispatch(
      fetchAllProcesses(
        {
          pageNo: activePage,
          tenant_key: tenantKey,
          processType: "DMN",
          limit: limit,
          searchKey: search,
          sortBy: currentDmnSort.activeKey,
          sortOrder: currentDmnSort[currentDmnSort.activeKey].sortOrder,
        },
        () => {
          setIsLoading(false);
          setSearchDmnLoading(false);
        }
      )
    );
  }, [dispatch, activePage, limit, searchText, currentDmnSort]);
  const handleSort = (key) => {
    setCurrentDmnSort((prevSort) => {
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
    { text: "10", value: 10 },
    { text: "25", value: 25 },
    { text: "50", value: 50 },
    { text: "100", value: 100 },
    { text: "All", value: totalCount },
  ];

  const handleClearSearch = () => {
    setSearch("");
    setActivePage(1);
    dispatch(setDmnSearchText(""));
  };
  const handleSearch = () => {
    setSearchDmnLoading(true);
    setActivePage(1);
    dispatch(setDmnSearchText(search));
  };
  const onLimitChange = (newLimit) => {
    setLimit(newLimit);
    handlePageChange(1);
  };
  const handlePageChange = (page) => setActivePage(page);
  const gotoEdit = (data) => {
    if (MULTITENANCY_ENABLED) {
      dispatch(setIsPublicDiagram(!!data.tenantId));
    }
    dispatch(push(`${redirectUrl}processes/dmn/${data.key}/edit`));
  };
  return (
    <div className="d-md-flex justify-content-between align-items-center pb-3 flex-wrap">
      <div className="d-md-flex align-items-center p-0 search-box input-group input-group width-25">
        <CustomSearch
          search={search}
          setSearch={setSearch}
          handleSearch={handleSearch}
          handleClearSearch={handleClearSearch}
          placeholder={t("Search Decision Table")}
          searchLoading={searchDmnLoading}
          title={t("Search DMN Name")}
          dataTestId="DMN-search-input"
        />
      </div>
      <div className="d-md-flex justify-content-end align-items-center ">
        <CustomButton
          variant="primary"
          size="sm"
          label={t("New DMN")}
          dataTestid="create-DMN-button"
          ariaLabel="Create DMN"
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
                      currentSort={currentDmnSort}
                      handleSort={handleSort}
                      className="ms-4"
                    />
                  </th>
                  <th className="w-20" scope="col">
                    <SortableHeader
                      columnKey="id"
                      title="ID"
                      currentSort={currentDmnSort}
                      handleSort={handleSort}
                    />
                  </th>
                  <th className="w-15" scope="col">
                    <SortableHeader
                      columnKey="modified"
                      title="Last Edited"
                      currentSort={currentDmnSort}
                      handleSort={handleSort}
                    />
                  </th>
                  <th className="w-15" scope="col">
                    <SortableHeader
                      columnKey="status"
                      title="Status"
                      currentSort={currentDmnSort}
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
                {dmn.map((dmnItem) => (
                  <ReusableTableRow
                    key={dmnItem.id}
                    item={dmnItem}
                    gotoEdit={gotoEdit}
                    buttonLabel="Dmn"
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
  );
});

export default DecisionTable;
