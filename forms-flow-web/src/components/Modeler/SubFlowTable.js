import React, { useEffect, useState } from "react";
import {
  CustomButton,
  CustomSearch,
  DownArrowIcon,
} from "@formsflow/components";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation ,Translation } from "react-i18next";
import { HelperServices } from "@formsflow/service";
import { fetchAllProcesses } from "../../apiManager/services/processServices";
import { Dropdown } from "react-bootstrap";
import Pagination from "react-js-pagination";
import LoadingOverlay from "react-loading-overlay-ts";
import {
  setBpmnSearchText,
  setIsPublicDiagram,
} from "../../actions/processActions";
import { push } from "connected-react-router";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import SortableHeader from '../CustomComponents/SortableHeader';

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
  const totalSubflowCount = useSelector((state) => state.process.totalCount);
  const [search, setSearch] = useState(searchText || "");
  const [currentBPMNsort, setSort] = useState({ sortBy:"name",sortOrder: "asc" });
  const [searchSubflowLoading, setSearchSubflowLoading] = useState(false);
  useEffect(() => {
    setIsLoading(true);
    setSearchSubflowLoading(true);
    dispatch(
      fetchAllProcesses(
        {
          pageNo: activePage,
          tenant_key: tenantKey,
          processType: "BPMN",
          limit: limit,
          searchKey: search,
          sortBy: currentBPMNsort.sortBy,
          sortOrder: currentBPMNsort.sortOrder,
        },
        () => {
          setIsLoading(false);
          setSearchSubflowLoading(false);
        }
      )
    );
  }, [dispatch, activePage, limit, searchText, currentBPMNsort]);


  const handleSort = (key) => {
    setSort((prevSort) => {
      let newSortOrder = "asc";

      if (prevSort.sortBy === key) {
        newSortOrder = prevSort.sortOrder === "asc" ? "desc" : "asc";
      }
      return {
        sortBy: key,
        sortOrder: newSortOrder,
      };
    });
  };
  const pageOptions = [
    {
      text: "5",
      value: 5,
    },
    {
      text: "25",
      value: 25,
    },
    {
      text: "50",
      value: 50,
    },
    {
      text: "100",
      value: 100,
    },
    {
      text: "All",
      value: totalSubflowCount,
    },
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
    setActivePage(1);
    dispatch(setBpmnSearchText(search));
  };
  const gotoEdit = (data) => {
    if (MULTITENANCY_ENABLED) {
      dispatch(setIsPublicDiagram(data.tenantId ? true : false));
    }
    dispatch(
      push(`${redirectUrl}processes/bpmn/${data.parentProcessKey}/edit`)
    );
  };

  return (
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
                    currentSort={currentBPMNsort}
                    handleSort={handleSort}
                     />

                  </th>
                  <th className="w-20" scope="col">
                  <SortableHeader 
                    columnKey="id"
                    title="id"
                    currentSort={currentBPMNsort}
                    handleSort={handleSort}
                  />
                  </th>
                  <th className="w-15" scope="col">
                  <SortableHeader 
                    columnKey="modified"
                    title="Last Edited"
                    currentSort={currentBPMNsort}
                    handleSort={handleSort}
                  />
                  </th>
                  <th className="w-15" scope="col">
                  <SortableHeader 
                    columnKey="status"
                    title="Status"
                    currentSort={currentBPMNsort}
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
                  <tr key={processItem.id}>
                    <td className="w-25">
                      <span className="ms-4">{processItem.name}</span>
                    </td>
                    <td className="w-20">
                      <span className="">{processItem.parentProcessKey}</span>
                    </td>
                    <td className="w-15">
                      {HelperServices?.getLocaldate(processItem.modified)}
                    </td>
                    <td className="w-15">
                      <span
                        data-testid={`sub-flow-status-${processItem._id}`}
                        className="d-flex align-items-center"
                      >
                        {processItem.status === "active" ? (
                          <>
                            <span className="status-live"></span>
                          </>
                        ) : (
                          <span className="status-draft"></span>
                        )}
                        {processItem.status === "active"
                          ? t("Live")
                          : t("Draft")}
                      </span>
                    </td>
                    <td className="w-25">
                      <span className="d-flex justify-content-end">
                        <CustomButton
                          variant="secondary"
                          size="sm"
                          label={<Translation>{(t) => t("Edit")}</Translation>}
                          className="float-right"
                          ariaLabel="Edit Form Button"
                          onClick={() => gotoEdit(processItem)}
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
                        {Math.min(limit * activePage, totalSubflowCount)}{" "}
                        {t("of")}&nbsp;
                        {totalSubflowCount} {t("results")}
                      </span>
                    </div>
                  </td>
                  <td colSpan={3}>
                    <div className="d-flex align-items-center justify-content-around">
                      <Pagination
                        activePage={activePage}
                        itemsCountPerPage={limit}
                        totalItemsCount={totalSubflowCount}
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
                            {pageOptions.map((option, index) => (
                              <Dropdown.Item
                                key={index}
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

export default SubFlow;
