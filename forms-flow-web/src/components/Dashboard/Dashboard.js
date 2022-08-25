/* eslint-disable no-unused-vars */
import React, { Fragment, useEffect, useRef, useState } from "react";
import ApplicationCounter from "./ApplicationCounter";
import { useDispatch, useSelector } from "react-redux";
import { Route, Redirect } from "react-router";
import StatusChart from "./StatusChart";
import Modal from "react-bootstrap/Modal";
import {
  fetchMetricsSubmissionCount,
  fetchMetricsSubmissionStatusCount,
} from "../../apiManager/services/metricsServices";
import Pagination from "react-js-pagination";
import Loading from "../../containers/Loading";
import LoadError from "../Error";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import moment from "moment";
import { Translation, useTranslation } from "react-i18next";
import {
  setMetricsDateRangeLoading,
  setMetricsSubmissionLimitChange,
  setMetricsSubmissionPageChange,
  setMetricsSubmissionSearch,
  setMetricsSubmissionSort,
  SetSubmissionStatusCountLoader,
  setMetricsDateChange,
} from "../../actions/metricsActions";
import LoadingOverlay from "@ronchalant/react-loading-overlay";
import { Button } from "react-bootstrap";
import { push } from "connected-react-router";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import Head from "../../containers/Head";
import { getUserInsightsPermission } from "../../helper/user";
const Dashboard = React.memo(() => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const submissionsList = useSelector((state) => state.metrics.submissionsList);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const submissionsStatusList = useSelector(
    (state) => state.metrics.submissionsStatusList
  );
  const isMetricsLoading = useSelector(
    (state) => state.metrics.isMetricsLoading
  );
  const isMetricsStatusLoading = useSelector(
    (state) => state.metrics.isMetricsStatusLoading
  );
  const selectedMetricsId = useSelector(
    (state) => state.metrics.selectedMetricsId
  );
  const metricsLoadError = useSelector(
    (state) => state.metrics.metricsLoadError
  );
  const metricsStatusLoadError = useSelector(
    (state) => state.metrics.metricsStatusLoadError
  );
  const sortOrder = useSelector((state) => state.metrics.sortOrder);
  const searchText = useSelector((state) => state.metrics.searchText);


  const activePage = useSelector((state) => state.metrics.pageno);
  const limit = useSelector((state) => state.metrics.limit);
  const totalItems = useSelector((state) => state.metrics.totalItems);
  const pageRange = useSelector((state) => state.metrics.pagination.numPages);
  const sort = useSelector((state) => state.metrics.sort);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const submissionStatusCountLoader = useSelector(
    (state) => state.metrics.submissionStatusCountLoader
  );
  const metricsDateRangeLoader = useSelector(
    (state) => state.metrics.metricsDateRangeLoader
  );
  const dateRange = useSelector((state) => state.metrics.submissionDate);
  const [selectedLimitValue, setSelectedLimitValue] = useState(limit);
  let numberofSubmissionListFrom =
    activePage === 1 ? 1 : (activePage * limit) - limit + 1;
  let numberofSubmissionListTo = activePage === 1 ? limit : limit * activePage;

  const [isAscending, setIsAscending] = useState(false);
  const [searchBy, setSearchBy] = useState("created");
  const [sortsBy, setSortsBy] = useState("formName");

  const [showSubmissionData, setSHowSubmissionData] = useState(
    submissionsList[0]
  );
  const [show, setShow] = useState(false);
  // State to set search text for submission data
  const [showClearButton, setShowClearButton] = useState("");
  const searchInputBox = useRef("");
  //Array for pagination dropdown
  const options = [
    { value: '6', label: '6' },
    { value: '12', label: '12' },
    { value: '30', label: '30' },
    { value: totalItems, label: 'All' }
  ];

  // Function to handle search text
  const handleSearch = () => {
    dispatch(setMetricsSubmissionLimitChange(6));
    dispatch(setMetricsSubmissionSearch(searchInputBox.current.value));

  };
  const onClear = () => {
    searchInputBox.current.value = "";
    setShowClearButton(false);
    handleSearch();
  };
  const clearDate = () => {
    console.log("clear date");
  };
  // Function to handle sort for submission data
  const handleSort = () => {
    //setOpacity(1);
    setIsAscending(!isAscending);
    const updatedQuery = {
      sort: isAscending ? 'asc' : "desc",
    };
    dispatch(setMetricsSubmissionSort(updatedQuery.sort || "asc"));
  };
  // Function to handle page limit change for submission data
  const handleLimitChange = (limit) => {
    setSelectedLimitValue(limit);
    dispatch(setMetricsSubmissionLimitChange(limit));
  };
  // Function to handle pageination page change for submission data
  const handlePageChange = (pageNumber) => {
    dispatch(setMetricsSubmissionPageChange(pageNumber));
  };
  const getFormattedDate = (date) => {
    return moment.utc(date).format("YYYY-MM-DDTHH:mm:ssZ").replace("+", "%2B");
  };
  useEffect(() => {
    const fromDate = getFormattedDate(dateRange[0]);
    const toDate = getFormattedDate(dateRange[1]);
    dispatch(setMetricsDateRangeLoading(true));
    setShowClearButton(searchText);
    setSelectedLimitValue(limit);
    /*eslint max-len: ["error", { "code": 170 }]*/
    dispatch(fetchMetricsSubmissionCount(fromDate, toDate, searchBy, searchText, activePage, limit, sortsBy, sortOrder, (err, data) => { }));
  }, [dispatch, activePage, limit, sortsBy, sortOrder, dateRange, searchText, searchBy]);
  useEffect(() => {
    setSHowSubmissionData(submissionsList[0]);
  }, [submissionsList]);

  const onChangeInput = (option) => {
    dispatch(setMetricsSubmissionLimitChange(6));
    setSearchBy(option);
  };
  if (isMetricsLoading) {
    return <Loading />;
  }
  const getStatusDetails = (id) => {
    const fromDate = getFormattedDate(dateRange[0]);
    const toDate = getFormattedDate(dateRange[1]);
    dispatch(SetSubmissionStatusCountLoader(true));
    dispatch(
      fetchMetricsSubmissionStatusCount(
        id,
        fromDate,
        toDate,
        searchBy,
        (err, data) => {
          dispatch(SetSubmissionStatusCountLoader(false));
          setShow(true);
        }
      )
    );
  };

  const onSetDateRange = (date) => {
    dispatch(setMetricsSubmissionLimitChange(6));
    dispatch(setMetricsDateRangeLoading(true));
    dispatch(setMetricsDateChange(date));
  };
  const headerList = () => {
    return [
      {
        name: "Metrics",
        count: totalItems,
        onClick: () => dispatch(push(`${redirectUrl}metrics`)),
        icon: "pie-chart",
      },
      {
        name: "Insights",
        onClick: () => dispatch(push(`${redirectUrl}insights`)),
        icon: "lightbulb-o",
      },
    ];
  };


  const noDefaultApplicationAvailable =
    !searchInputBox.current.value && !submissionsList.length ? true : false;
  const noOfApplicationsAvailable = submissionsList?.length || 0;
  if (metricsLoadError) {
    return (
      <LoadError text={t("The operation couldn't be completed. Please try after sometime")} />
    );
  }
  return (
    <Fragment>
      <LoadingOverlay
        active={metricsDateRangeLoader || submissionStatusCountLoader}
        spinner
        text={t("Loading...")}
      >
        <div className="container dashboard_container mb-4" id="main" role="complementary" >
          <div className="dashboard mb-2" >
            <div className="row ">
              <div className="col-12" >
                <Head items={headerList()} page="Metrics"/>
                <div className="row ">
                  <div className="col-12 col-lg-4 ">
                    <h2 className="application-title">
                      <i className="fa fa-bars mr-1" />
                      <Translation>{(t) => t("Submissions")}</Translation>
                    </h2>
                  </div>
                  <div className="col-12 col-lg-5">
                    <div style={{ width: "200px", float: "right" }}>
                      <select
                        onChange={(e) => onChangeInput(e.target.value)}
                        className="date-select mx-5 mb-3"
                        title="choose any"
                        aria-label="Select date type"
                      >
                        <option className="date-select" value="created">
                          {t("Created Date")}
                        </option>
                        <option className="date-select" value="modified">
                          {t("Modified Date")}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div className="col-12 col-lg-3 d-flex align-items-end flex-lg-column mt-3 mt-lg-0">
                    <DateRangePicker
                      onChange={onSetDateRange}
                      value={dateRange}
                      dayPlaceholder="dd"
                      monthPlaceholder="mm"
                      yearPlaceholder="yyyy"
                      calendarAriaLabel="Select the date"
                      dayAriaLabel="Select the day"
                      clearAriaLabel="Clear value"
                      clearIcon={null}
                    />
                  </div>
                </div>
                <div className="row mt-2 mx-2">
                  <div className="col">
                    <div className="input-group">
                      <span
                        className="sort-span"
                        onClick={handleSort}
                        style={{
                          cursor: "pointer",
                        }}>
                        <i
                          className="fa fa-long-arrow-up fa-lg mt-2 fa-lg-hover"
                          title="Sort by form name"
                          style={{
                            opacity: `${sortOrder === "asc" ? 1 : 0.5}`,
                          }}
                        />
                        <i
                          className="fa fa-long-arrow-down fa-lg mt-2 ml-1 fa-lg-hover"
                          title="Sort by form name"
                          style={{
                            opacity: `${sortOrder === "desc" ? 1 : 0.5}`,
                          }}
                        />
                      </span>
                      <div className="form-outline ml-3">
                        <input
                          type="search"
                          id="form1"
                          ref={searchInputBox}
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleSearch()
                          }
                          onChange={(e) => {
                            setShowClearButton(e.target.value);
                            e.target.value === "" && handleSearch();
                          }}
                          autoComplete="off"
                          className="form-control"
                          placeholder={t(searchText ? searchText : "Search...")}
                        />
                      </div>
                      {showClearButton && (
                        <button
                          type="button"
                          className="btn btn-outline-primary ml-2"
                          onClick={() => onClear()}
                        >
                          <i className="fa fa-times"></i>
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-outline-primary ml-2"
                        name="search-button"
                        title={t("Click to search")}
                        onClick={() => handleSearch()}
                      >
                        <i className="fa fa-search"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {submissionsList.length ? (
                <div className="col-12">
                  {!metricsDateRangeLoader && <ApplicationCounter
                    className="dashboard-card"
                    application={submissionsList}
                    getStatusDetails={getStatusDetails}
                    selectedMetricsId={selectedMetricsId}
                    noOfApplicationsAvailable={noOfApplicationsAvailable}
                    setSHowSubmissionData={setSHowSubmissionData}
                  />}
                </div>
              ) : (
                <div className="col-12 col-sm-6 col-md-6 no_submission_main">
                  {!metricsDateRangeLoader && <div className="col-12 col-sm-6 col-md-6 no_sumbsmission">
                    <h3>{t("No submissions found")}</h3>
                  </div>}
                </div>
              )}
              {submissionsList.length && !metricsDateRangeLoader ? (
                <div className=" w-100 p-3 d-flex align-items-center">
                  <Pagination
                    activePage={activePage}
                    itemsCountPerPage={limit}
                    totalItemsCount={totalItems}
                    pageRangeDisplayed={pageRange < 5 ? pageRange : 5}
                    itemClass="page-item"
                    linkClass="page-link"
                    onChange={handlePageChange}
                  />
                  <select
                    title="Choose page limit"
                    onChange={(e) => handleLimitChange(e.target.value)}
                    value={selectedLimitValue}
                    className="form-select mx-5 mb-3"
                    aria-label="Choose page limit"
                  >
                    {/* eslint max-len: ["error", { "code": 500 }] */}
                    {options.map(({ value, label }, index) => <option value={value} key={index} >{label}</option>)}
                  </select>

                  <span>
                    {t("Showing")} {numberofSubmissionListFrom} {t("to")}{" "}
                    {numberofSubmissionListTo > totalItems
                      ? totalItems
                      : numberofSubmissionListTo}{" "}
                    {t("of")} {totalItems}
                  </span>
                </div>
              ) : null}
              {metricsStatusLoadError && <LoadError />}
              {noOfApplicationsAvailable > 0 && (
                <div className="col-12">
                  {isMetricsStatusLoading ? (
                    <Loading />
                  ) : (
                    <Modal
                      show={show}
                      size="lg"
                      onHide={() => setShow(false)}
                      aria-labelledby="example-custom-modal-styling-title"
                    >
                      <Modal.Header closeButton>
                        <Modal.Title id="example-custom-modal-styling-title">
                          {t("Submission Status")}
                        </Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <StatusChart
                          submissionsStatusList={submissionsStatusList}
                          submissionData={showSubmissionData}
                        />
                      </Modal.Body>
                    </Modal>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <Route path={"/metrics/:notAvailable"}>
          {" "}
          <Redirect exact to="/404" />
        </Route>
      </LoadingOverlay>
    </Fragment >
  );
});

export default Dashboard;