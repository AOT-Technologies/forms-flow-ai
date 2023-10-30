import React, { useEffect, useState } from "react";

import {  Dropdown } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import Pagination from "react-js-pagination";
import LoadingOverlay from "react-loading-overlay";

import { fetchAllDmnProcesses, fetchAllDmnProcessesCount } from "../../../apiManager/services/processServices";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import { setDmnSearchText } from "../../../actions/processActions";
function DmnTable() {
  const dispatch = useDispatch();
  const dmn = useSelector((state) => state.process?.dmnProcessList);
  const searchText = useSelector((state) => state.process?.dmnSearchText);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const [activePage, setActivePage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState("");
  const [totalProcess,setTotalProcess] = useState(0);
  const [countLoading, setCountLoading] = useState(true);
   const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  //this function used for showing loading
  
 

  const handlePageChange = (page)=> setActivePage(page);
 

  useEffect(() => {
    const firstResult = (activePage - 1) * limit;
    setIsLoading(true);
    dispatch(
      fetchAllDmnProcesses(tenantKey,firstResult,limit,searchText, () => {
        setIsLoading(false);
      })
    );
    setCountLoading(true);
    fetchAllDmnProcessesCount(tenantKey, search).then((result) => {
      setTotalProcess(result.data?.count || 0);
    }).catch((err)=>{
      console.error(err);
    }).finally(()=> { setCountLoading(false);});
    
  }, [tenantKey, limit,activePage, searchText,dispatch]);


  useEffect(()=>{
    setSearch(searchText);
  },[searchText]);

 

  const onLimitChange = (newLimit) => setLimit(newLimit);

  const handleSearchButtonClick = () => {
     dispatch(setDmnSearchText(search));
     setActivePage(1);
  };

  const onClearSearch = () => {
    setSearch('');
    dispatch(setDmnSearchText(''));
    setActivePage(1);
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
    <div className="p-3">
      <LoadingOverlay spinner text="Loading..." active={isLoading || countLoading}>
        <div style={{ minHeight: "400px" }}>
          <div className="input-group mb-2 mt-2 w-25">
            <div className="input-group-prepend">
              <span className="input-group-text">
                <i className="fa fa-search"></i>
              </span>
            </div>
            <input
              type="text"
              className="form-control"
              placeholder="Search workflow"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="input-group-append">
              {search && (
                <button
                  className="btn btn-light"
                  type="button"
                  onClick={onClearSearch}
                >
                  <i className="fa fa-close" />
                </button>
              )}
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleSearchButtonClick}
              >
                {t("Search")}
              </button>
            </div>
          </div>
          <table className="table border mt-2">
            <thead>
              <tr>
                <th scope="col">{t("Key")}</th>
                <th scope="col">{t("Workflow Name")}</th>
                <th scope="col">{t("Type")}</th>
                <th scope="col">{t("Edit")}</th>
              </tr>
            </thead>
            {!totalProcess ? (
  <tbody>
    <tr className="no-results-row">
      <td colSpan="4" style={{ height: "300px" }} className="text-center">
        {t("No DMN Found")}
      </td>
    </tr>
  </tbody>
) : (
  <tbody>
    {dmn.map((processItem) => (
      <tr key={processItem.id}>
        <th scope="row">{processItem.key}</th>
        <td>{processItem.name}</td>
        <td>{t("DMN")}</td>
        <td>
          <Link to={`${redirectUrl}processes/dmn/${processItem.key}/edit`}>
            {t("Edit")}
          </Link>
        </td>
      </tr>
    ))}
  </tbody>
)}

          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex" >
             <span className="mr-2"> {t("Rows per page")}</span>
              <Dropdown>
              <Dropdown.Toggle variant="light" id="dropdown-basic">
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
                  >
                    {option.text}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
              </Dropdown>
            <span className="ml-2">
           {t("Showing")} {(limit * activePage) - (limit - 1)} {t("to")}&nbsp;
           {Math.min(limit * activePage, totalProcess)} {t("of")}&nbsp;
           {totalProcess} {t("entries")}
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
              />
            )}
          </div>
        </div>
      </LoadingOverlay>
    </div>
  );
}

export default DmnTable;
