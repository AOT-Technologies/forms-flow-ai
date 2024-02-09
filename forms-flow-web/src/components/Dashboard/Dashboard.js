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
import { useTranslation } from "react-i18next";
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
import {
  Dropdown, 
  FormControl,
  InputGroup,
} from "react-bootstrap";
import { push } from "connected-react-router";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import Head from "../../containers/Head";
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

  const metricsLoadError = useSelector(
    (state) => state.metrics.metricsLoadError
  );
  const metricsStatusLoadError = useSelector(
    (state) => state.metrics.metricsStatusLoadError
  );
  const sortOrder = useSelector((state) => state.metrics.sortOrder);
  const searchText = useSelector((state) => state.metrics.searchText);
  const [searchTextInput, setSearchTextInput] = useState(searchText);

  const activePage = useSelector((state) => state.metrics.pageno);
  const limit = useSelector((state) => state.metrics.limit);
  const totalItems = useSelector((state) => state.metrics.totalItems);
  const pageRange = useSelector((state) => state.metrics.pagination.numPages);
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
      activePage === 1 ? 1 : ((activePage - 1) * limit) + 1;
  let numberofSubmissionListTo = activePage === 1 ? limit : limit * activePage;
  const [isAscending, setIsAscending] = useState(true);
  const [searchBy, setSearchBy] = useState("created");
  const [sortsBy, setSortsBy] = useState("formName");

  const [showSubmissionData, setSHowSubmissionData] = useState(submissionsList[0]);
  const [show, setShow] = useState(false);
  // State to set search text for submission data
  const [showClearButton, setShowClearButton] = useState("");
  const searchInputBox = useRef("");
  //Array for pagination dropdown
  const options = [
    { value: "9", label: "9" },
    { value: "12", label: "12" },
    { value: "30", label: "30" },
    { value: totalItems, label: "All" },
  ];
  // Function to handle search text
  const handleSearch = () => {
    dispatch(setMetricsSubmissionPageChange(1));
    dispatch(setMetricsSubmissionLimitChange(9));
    dispatch(setMetricsSubmissionSearch(searchInputBox.current.value));
  };
  const onClear = () => {
    searchInputBox.current.value = "";
    setSearchTextInput("");
    setShowClearButton(false);
    handleSearch();
  };

  // Function to handle sort for submission data
  const handleSort = (updateSort) => {
    dispatch(setMetricsSubmissionPageChange(1));
    setIsAscending(!isAscending);
    dispatch(setMetricsSubmissionSort(updateSort));
  };
  // Function to handle page limit change for submission data
  const handleLimitChange = (limit) => {
    const newPageNumber = Math.ceil(totalItems / limit);
    if (newPageNumber < activePage) {
      dispatch(setMetricsSubmissionPageChange(newPageNumber));
    }
    dispatch(setMetricsSubmissionLimitChange(limit));
  };
  // Function to handle pageination page change for submission data
  const handlePageChange = (pageNumber) => {
    dispatch(setMetricsSubmissionPageChange(pageNumber));
  };
  const getFormattedDate = (date) => {
    return moment
      .utc(date)
      .format("YYYY-MM-DDTHH:mm:ssZ")
      .replace(/\+/g, "%2B");
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
    dispatch(setMetricsSubmissionLimitChange(limit));
    setSearchBy(option);
  };
  if (isMetricsLoading) {
    return <Loading />;
  }
  const getStatusDetails = (id,options) => {
    const fromDate = getFormattedDate(dateRange[0]);
    const toDate = getFormattedDate(dateRange[1]);
    dispatch(SetSubmissionStatusCountLoader(true));
    dispatch(
      fetchMetricsSubmissionStatusCount(
        id,
        fromDate,
        toDate,
        searchBy,
        options,
        (err, data) => {
          dispatch(SetSubmissionStatusCountLoader(false));
          setShow(true);
        }
      )
    );
  };

  const onSetDateRange = (date) => {
    if (date) {
      dispatch(setMetricsSubmissionLimitChange(limit));
      dispatch(setMetricsSubmissionPageChange(1));
      dispatch(setMetricsDateRangeLoading(true));
      dispatch(setMetricsDateChange(date));
    } else {
      const now = new Date();
      let firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      let lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      dispatch(setMetricsDateChange([firstDay, lastDay]));
    }
  };
  const headerList = () => {
    return [
      {
        name: "Metrics",
        count: totalItems,
        onClick: () => dispatch(push(`${redirectUrl}metrics`)),
        icon: "line-chart me-2",
      },
      {
        name: "Insights",
        onClick: () => dispatch(push(`${redirectUrl}insights`)),
        icon: "lightbulb-o me-2",
      },
    ];
  };

  const noOfApplicationsAvailable = submissionsList?.length || 0;
  if (metricsLoadError) {
    return (
      <LoadError
        text={t(
          "The operation couldn't be completed. Please try after sometime"
        )}
      />
    );
  }
  return (
    <Fragment>
      <LoadingOverlay active={submissionStatusCountLoader} spinner>
        <div
          className="mb-4"
          id="main"
          role="complementary"
        >
          <Head items={headerList()} page="Metrics" />
          <div className="d-flex flex-wrap justify-content-between col-md-12">
          <div className="custom-input-group col-12 col-md-4 px-0">
      <InputGroup>
        <FormControl
          type="search"
          title="Search"
          ref={searchInputBox}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          onChange={(e) => {
            setShowClearButton(e.target.value);
            setSearchTextInput(e.target.value);
            e.target.value === "" && handleSearch();
          }}
          autoComplete="off"
          value={searchTextInput}
          placeholder={t("Search...")}
          className="bg-white"
        />
        {showClearButton && (
          <InputGroup.Append className="d-flex cursor-pointer"onClick={() => onClear()}>
            <InputGroup.Text className= "bg-white rounded-0">
              <i className="fa fa-times"></i>
            </InputGroup.Text>
          </InputGroup.Append>
        )}

        <InputGroup.Append
          title={t("Click to search")}
          onClick={() => handleSearch()}
          className="d-flex cursor-pointer"
        >
          <InputGroup.Text className= "bg-white rounded-start-0">
            <i className="fa fa-search"></i>
          </InputGroup.Text>
        </InputGroup.Append>
        </InputGroup>
    </div>

            <div className="d-flex justify-content-end align-items-center col-12 col-md-4 px-0">
              <div className="input-group me-2">
                <FormControl
                  as="select"
                  onChange={(e) => onChangeInput(e.target.value)}
                  className="form-select p-1"
                  title={t("Choose any")}
                  aria-label="Select date type"
                >
                  <option value="created">{t("Created Date")}</option>
                  <option value="modified">{t("Modified Date")}</option>
                </FormControl>
              </div>
              <DateRangePicker className = "bg-white me-2"
                onChange={onSetDateRange}
                value={dateRange}
                dayPlaceholder="dd"
                monthPlaceholder="mm"
                yearPlaceholder="yyyy"
                calendarAriaLabel={t("Select the date")}
                dayAriaLabel="Select the day"
                clearAriaLabel="Clear value"
                name="selectDateRange"
                monthAriaLabel="Select the month"
                yearAriaLabel="Select the year"
                nativeInputAriaLabel="Date"
              />
              <div className="ms-2">
                {isAscending ? (
                  <i
                    className="fa fa-sort-alpha-asc dashboard-sort cursor-pointer"
                    onClick={() => {
                      handleSort("desc");
                    }}
                    data-toggle="tooltip"
                    title={t("Descending")}
                  ></i>
                ) : (
                  <i
                    className="fa fa-sort-alpha-desc dashboard-sort cursor-pointer"
                    onClick={() => {
                      handleSort("asc");
                    }}
                    data-toggle="tooltip"
                    title={t("Ascending")}
                  ></i>
                )}
              </div>
            </div>
          </div>

          <div className="dashboard dashboard-height d-flex">
            {submissionsList.length ? (
              <div className="col-12 px-0">
                {!metricsDateRangeLoader && (
                  <ApplicationCounter
                    className="dashboard-card"
                    application={submissionsList}
                    getStatusDetails={getStatusDetails}
                    noOfApplicationsAvailable={noOfApplicationsAvailable}
                    setSHowSubmissionData={setSHowSubmissionData}
                  />
                )}
              </div>
            ) : (
              <>
              {!metricsDateRangeLoader && (
                
                  <h3 className = "text-center w-100 p-5">{t("No submissions found")}</h3>
                
              )}</>
            )}
          </div>

          {submissionsList.length && !metricsDateRangeLoader ? (
            <div className="d-flex justify-content-between align-items-center mt-3">
                 <div className="d-flex align-items-center">
          <span className="me-2"> {t("Items per page")}</span>
          <Dropdown>
                <Dropdown.Toggle variant="light" id="dropdown-basic">
                  {selectedLimitValue}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                
                    {options.map((option, index) => (
                  <Dropdown.Item
                    key={index}
                    type="button"
                    onClick={() => {
                      handleLimitChange(option.value);
                    }}
                  >
                    {option.label}
                  </Dropdown.Item>
                ))}
                </Dropdown.Menu>
              </Dropdown>
              <span className="ms-2">
                  {t("Showing")} {numberofSubmissionListFrom} {t("to")}{" "}
                  {numberofSubmissionListTo > totalItems
                    ? totalItems
                    : numberofSubmissionListTo}{" "}
                  {t("of")} {totalItems} {t("results")}
                </span>
          </div>
              
              <div className="d-flex align-items-center">
                <Pagination
                  activePage={activePage}
                  itemsCountPerPage={limit}
                  totalItemsCount={totalItems}
                  pageRangeDisplayed={pageRange < 5 ? pageRange : 5}
                  itemClass="page-item"
                  linkClass="page-link"
                  onChange={handlePageChange}
                />
              </div>
            </div>
          ) : null}
           {metricsStatusLoadError && <LoadError />}
        {noOfApplicationsAvailable > 0 && (
          <div className="col-12">
            {isMetricsStatusLoading || metricsDateRangeLoader ? (
              <Loading />
            ) : (
              <Modal
                show={show}
                size="lg"
                onHide={() => setShow(false)}
                aria-labelledby="example-custom-modal-styling-title"
              >
                <Modal.Header>
                  <Modal.Title id="example-custom-modal-styling-title">
                    {t("Submission Status")}
                  </Modal.Title>
                  <button type="button" className="btn-close me-2" onClick={() => setShow(false)}></button>
                  </Modal.Header>
                <Modal.Body>
                  <StatusChart
                    submissionsStatusList={submissionsStatusList}
                    submissionData={showSubmissionData}
                    getStatusDetails={getStatusDetails}
                    submissionStatusCountLoader={submissionStatusCountLoader}
                        />
                      </Modal.Body>
                    </Modal>
                  )}

          </div>
        )}
        </div>



        <Route path={"/metrics/:notAvailable"}>
          {" "}
          <Redirect exact to="/404" />
        </Route>
      </LoadingOverlay>
    </Fragment>
  );
});

export default Dashboard;
