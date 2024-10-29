import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  CustomButton,
  CustomSearch,
  DownArrowIcon,
} from "@formsflow/components";
import LoadingOverlay from "react-loading-overlay-ts";
import { useTranslation } from "react-i18next";
import SortableHeader from "../CustomComponents/SortableHeader";
import { fetchAllProcesses } from "../../apiManager/services/processServices";
import { Dropdown } from "react-bootstrap";
import Pagination from "react-js-pagination";
import { HelperServices } from "@formsflow/service";
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
      dispatch(setIsPublicDiagram(data.tenantId ? true : false));
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
                  <tr key={dmnItem.id}>
                    <td className="w-25">
                      <span className="ms-4">{dmnItem.name}</span>
                    </td>
                    <td className="w-20">
                      <span>{dmnItem.parentProcessKey}</span>
                    </td>
                    <td className="w-15">
                      {HelperServices?.getLocaldate(dmnItem.modified)}
                    </td>
                    <td className="w-15">
                      <span
                        data-testid={`sub-flow-status-${dmnItem._id}`}
                        className="d-flex align-items-center"
                      >
                        <span
                          className={
                            dmnItem.status === "active"
                              ? "status-live"
                              : "status-draft"
                          }
                        ></span>
                        {dmnItem.status === "active"
                          ? t("Live")
                          : t("Draft")}
                      </span>
                    </td>
                    <td className="w-25">
                      <span className="d-flex justify-content-end">
                        <CustomButton
                          variant="secondary"
                          size="sm"
                          label={t("Edit")}
                          className="float-right"
                          ariaLabel="Edit DMN Button"
                          onClick={() => gotoEdit(dmnItem)}
                          dataTestid="Edit DMN Button"
                        />
                      </span>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3}>
                    <div className="d-flex justify-content-between align-items-center flex-column flex-md-row">
                      <span className="ms-2">
                        {t("Showing")} {(limit * activePage) - (limit - 1)}{" "}
                        {t("to")}&nbsp;
                        {Math.min(limit * activePage, totalCount)} {t("of")}
                        &nbsp;
                        {totalCount} {t("results")}
                      </span>
                    </div>
                  </td>
                  <td colSpan={3}>
                    <div className="d-flex align-items-center justify-content-around">
                      <Pagination
                        activePage={activePage}
                        itemsCountPerPage={limit}
                        totalItemsCount={totalCount}
                        pageRangeDisplayed={5}
                        itemClass="page-item"
                        linkClass="page-link"
                        onChange={handlePageChange}
                      />
                    </div>
                  </td>
                  <td colSpan={3}>
                    <div className="d-flex align-items-center justify-content-end">
                      <span className="pagination-text">
                        {t("Rows per page")}
                      </span>
                      <div className="pagination-dropdown">
                        <Dropdown data-testid="page-limit-dropdown">
                          <Dropdown.Toggle
                            variant="light"
                            id="dropdown-basic"
                            data-testid="page-limit-dropdown-toggle"
                          >
                            {limit}
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            {pageOptions.map((option) => (
                              <Dropdown.Item
                                key={option.value}
                                type="button"
                                data-testid={`page-limit-dropdown-item-${option.value}`}
                                onClick={() => {
                                  onLimitChange(option.value);
                                }}
                              >
                                {option.text}
                              </Dropdown.Item>
                            ))}
                          </Dropdown.Menu>
                        </Dropdown>
                        <DownArrowIcon />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </LoadingOverlay>
    </div>
  );
});

export default DecisionTable;
