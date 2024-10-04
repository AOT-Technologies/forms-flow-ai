import React, { useEffect, useState } from "react";

import { Dropdown, FormControl, InputGroup } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import Pagination from "react-js-pagination";
import LoadingOverlay from "react-loading-overlay-ts";

import {
  fetchAllDmnProcesses,
  fetchAllDmnProcessesCount,
} from "../../../apiManager/services/processServices";
import { useTranslation } from "react-i18next";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import { setDmnSearchText,setIsPublicDiagram } from "../../../actions/processActions";
import { push } from "connected-react-router";

function DmnTable() {
  const dispatch = useDispatch();
  const dmn = useSelector((state) => state.process?.dmnProcessList);
  const searchText = useSelector((state) => state.process?.dmnSearchText);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const [activePage, setActivePage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState("");
  const [totalProcess, setTotalProcess] = useState(0);
  const [countLoading, setCountLoading] = useState(true);
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  //this function used for showing loading

  const handlePageChange = (page) => setActivePage(page);

  useEffect(() => {
    const firstResult = (activePage - 1) * limit;
    setIsLoading(true);
    dispatch(
      fetchAllDmnProcesses(
        {
          tenant_key: tenantKey,
          firstResult: firstResult,
          maxResults: limit,
          searchKey: searchText,
        },
        () => {
          setIsLoading(false);
        }
      )
    );
    setCountLoading(true);
    fetchAllDmnProcessesCount(tenantKey, searchText)
      .then((result) => {
        setTotalProcess(result.data?.count || 0);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setCountLoading(false);
      });
  }, [tenantKey, limit, activePage, searchText, dispatch]);

  useEffect(() => {
    setSearch(searchText);
  }, [searchText]);

  const onLimitChange = (newLimit) => setLimit(newLimit);

  const handleSearchButtonClick = () => {
    dispatch(setDmnSearchText(search));
    setActivePage(1);
  };

  const onClearSearch = () => {
    setSearch("");
    dispatch(setDmnSearchText(""));
    setActivePage(1);
  };

  const gotoEdit = (data) => {
    if(MULTITENANCY_ENABLED){
      dispatch(setIsPublicDiagram(data.tenantId ? true : false));
    }
   dispatch(push(`${redirectUrl}processes/dmn/${data.key}/edit`));
  };

  const pageOptions = [
    { text: "5", value: 5 },
    { text: "10", value: 10 },
    { text: "25", value: 25 },
    { text: "50", value: 50 },
    { text: "100", value: 100 },
    { text: "All", value: totalProcess },
  ];

  return (
    <div className="mt-3">
      <LoadingOverlay
        spinner
        text={t("Loading...")}
        active={isLoading || countLoading}
      >
        <div className="dmn-table">
          <table className="table custom-table  table-responsive-sm mt-2">
            <thead>
              <tr>
                <th scope="col">{t("DMN Name")}</th>
                <th scope="col">{t("Key")}</th>
                <th scope="col">{t("Type")}</th>
                <th colSpan="2">
                <InputGroup className="input-group">
               <FormControl
                className="bg-white"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                onKeyDown={(e) =>
                  e.keyCode == 13 ? handleSearchButtonClick() : ""
                }
                placeholder={t("Search by DMN name")}
                title={t("Search by DMN name")}
                data-testid="processes-search-dmn-input-box"
                aria-label={t("Search by DMN name")}
                />
              {search && (
                <InputGroup.Append data-testid="processes-search-dmn-clear-button" onClick={onClearSearch}>
                  <InputGroup.Text className="h-100">
                    <i className="fa fa-times"></i>
                  </InputGroup.Text>
                </InputGroup.Append>
              )}
                    <InputGroup.Append
                      className="cursor-pointer"
                      data-testid="processes-search-dmn-click-button"
                      onClick={handleSearchButtonClick}
                      disabled={!search?.trim()}
                    >
                <InputGroup.Text 
                className="h-100 bg-white">
                  <i className="fa fa-search"></i>
                </InputGroup.Text>
              </InputGroup.Append>
            </InputGroup>
                </th>
              </tr>
            </thead>
            {!totalProcess ? (
              <tbody>
                <tr className="no-results-row">
                  <td
                    colSpan="4"
                    className="text-center no-results"
                  >
                   { isLoading ? null : t("No Dmn Found")}
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {dmn.map((processItem) => (
                  <tr key={processItem.id}>
                    <td>{processItem.name}</td>
                    <td>{processItem.key}</td>
                    <td>{t("DMN")}</td>
                    <td className="d-flex justify-content-end w-100">
                      <button
                        data-testid={`processes-edit-dmn-${processItem.key}`}
                        className="btn btn-link"
                        onClick={() => { gotoEdit(processItem); }}> 
                       <i className="fas fa-edit me-2"/>
                        {t("Edit DMN")}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {dmn.length ? (
          <div className="d-flex justify-content-between align-items-center  flex-column flex-md-row">
            <div className="d-flex align-items-center">
              <span className="me-2"> {t("Rows per page")}</span>
              <Dropdown data-testid="processes-dmn-pagination-dropdown">
                <Dropdown.Toggle data-testid="processes--dmn-pagination-dropdown-limit" variant="light" id="dropdown-basic">
                  {limit}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {pageOptions.map((option, index) => (
                    <Dropdown.Item
                      key={index}
                      type="button"
                      onClick={() => {
                        onLimitChange(option.value);
                      }}
                      data-testid={`processes-dmn-pagination-dropdown-limit-${index}`}
                    >
                      {option.text}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
              <span className="ms-2">
                {t("Showing")} {(limit * activePage) - (limit - 1)} {t("to")}
                &nbsp;
                {Math.min(limit * activePage, totalProcess)} {t("of")}&nbsp;
                {totalProcess} {t("results")}
              </span>
            </div>
            <div className="d-flex align-items-center">
              {!totalProcess ? (
                ""
              ) : (
                <Pagination
                  activePage={activePage}
                  itemsCountPerPage={limit}
                  totalItemsCount={totalProcess}
                  pageRangeDisplayed={5}
                  itemClass="page-item"
                  linkClass="page-link"
                  onChange={handlePageChange}
                  firstPageText={<span aria-label="Go to first page" title="Go to first page">«</span>}
                  lastPageText={<span aria-label="Go to last page" title="Go to last page">»</span>}
                  prevPageText={<span aria-label="Go to previous page" title="Go to previous page">⟨</span>}
                  nextPageText={<span aria-label="Go to next page" title="Go to next page">⟩</span>}
                />
              )}
            </div>
          </div>
        ) : null}
      </LoadingOverlay>
    </div>
  );
}

export default DmnTable;
