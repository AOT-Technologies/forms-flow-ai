import React, { useEffect, useRef, useState } from "react";
import { Col, Row } from "react-bootstrap";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import { useDispatch, useSelector } from "react-redux";
import { getAllApplications } from "../../apiManager/services/applicationServices";
import { useTranslation } from "react-i18next";
import { setApplicationLoading } from "../../actions/applicationActions";

const ApplicationFilter = ({ setDisplayFilter, filterParams, setFilterParams }) => {
  const dispatch = useDispatch();
  const createSearchNode = useRef();
  const [applicationId, setApplicationId] = useState(filterParams.id || "");
  const [applicationName, setApplicationName] = useState(filterParams.applicationName || "");
  const [applicationStatus, setApplicationStatus] = useState(filterParams.applicationStatus || "");
  const [lastModified, setLastModified] = useState(filterParams.modified || null);
  const applicationStatusOptions = useSelector(
    (state) => state.applications.applicationStatus
  );
  const pageNo = useSelector((state) => state.applications?.activePage);
  const limit = useSelector((state) => state.applications?.countPerPage);
  const sortOrder = useSelector((state) => state.applications?.sortOrder);
  const sortBy = useSelector((state) => state.applications?.sortBy);
  const { t } = useTranslation();
  const handleClick = (e) => {
    if (createSearchNode?.current?.contains(e.target)) {
      return;
    }
    // outside click
    setDisplayFilter(false);
  };

  useEffect(() => {
    // add when mounted
    document.addEventListener("mousedown", handleClick);
    // return function to be called when unmounted
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  const onSetDateRange = (selectedRange) => {
    setLastModified(selectedRange);
  };

  const clearAllFilters = () => {
    dispatch(setApplicationLoading(true));
    setApplicationId("");
    setApplicationStatus("");
    setApplicationName("");
    setLastModified(null);
    setFilterParams({});
    let filters = {
      applicationName: null,
      id: null,
      applicationStatus: null,
      modified: null,
      page: pageNo,
      limit: limit,
      sortOrder,
      sortBy
    };
    dispatch(getAllApplications(filters,(err,data) => {
      if(data){
        dispatch(setApplicationLoading(false));
      }
    }));
  };

  const applyFilters = () => {
    dispatch(setApplicationLoading(true));
    let filterParams = {
      applicationName: applicationName,
      id: applicationId,
      applicationStatus: applicationStatus,
      modified: lastModified,
      page: pageNo,
      limit: limit,
      sortOrder,
      sortBy
    };
    setFilterParams(filterParams);
    dispatch(getAllApplications(filterParams,(err,data) => {
      if(data){
        dispatch(setApplicationLoading(false));
      }
    }));
  };

  const getApplicationStatusOptions = (applicationStatusOptions) => {
    const selectOptions = applicationStatusOptions.map((option) => {
      return { value: option, label: option };
    });
    return selectOptions;
  };

  return (
    <div
      className="Filter-listview "
      style={{ minWidth: "500px" }}
      ref={createSearchNode}
    >
      <div className="bg-light ">
        <Row
          className="px-4 py-2"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "auto",
          }}
        ></Row>
      </div>
      <hr className="m-0 w-100" />
      <div className="m-4 px-2">
        <Row className="mt-2">
          <Col>
            <label>{t("Id")}</label>
            <input
              className="form-control"
              placeholder=""
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
            />
          </Col>
          <Col>
            <label>{t("Form Title")}</label>
            <input
              className="form-control"
              placeholder=""
              value={applicationName}
              onChange={(e) => setApplicationName(e.target.value)}
            />
          </Col>
        </Row>
      </div>
      <hr className="m-0 w-100" />
      <div className="m-4 px-2">
        <Row className="mt-2">
          <Col>
            <label>{t("Status")}</label>
            <select
              value={applicationStatus}
              onChange={(e) => setApplicationStatus(e.target.value)}
              className="form-control p-1"
            >
              <option value=""></option>
              {getApplicationStatusOptions(applicationStatusOptions).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Col>
          <Col className="mr-2" >
            <label>{t("Modified Date")}</label>
            <DateRangePicker
              onChange={(selectedRange) => {
                onSetDateRange(selectedRange);
              }}
              value={lastModified}
              maxDate={new Date()}
              minDate={new Date("January 1, 0999 01:01:00")}
              dayPlaceholder="dd"
              monthPlaceholder="mm"
              yearPlaceholder="yyyy"
              calendarAriaLabel="Select the date"
              dayAriaLabel="Select the day"
              clearAriaLabel="Click to clear"
            />
          </Col>
        </Row>
      </div>
      <hr className="mx-4" />
      <Row className="m-3 filter-cancel-btn-container ">
        <Col className="text-left">
          <span
            className="text-danger small "
            onClick={() => clearAllFilters()}
          >
            {t("Clear All Filters")}
          </span>
        </Col>
        <Col className="text-right">
          <button
            className="btn btn-light mr-1 "
            onClick={() => setDisplayFilter(false)}
          >
            {t("Cancel")}
          </button>
          <button
            className="btn btn-dark"
            onClick={() => applyFilters()}
          >
            {t("Show results")}
          </button>
        </Col>
      </Row>
    </div>
  );
};

export default ApplicationFilter;