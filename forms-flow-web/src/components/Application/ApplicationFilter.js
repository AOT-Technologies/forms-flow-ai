import React, { useEffect, useRef, useState } from "react";
import { Col, Row } from "react-bootstrap";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  setApplicationListActivePage,
  setApplicationListSearchParams,
  setApplicationLoading,
} from "../../actions/applicationActions";

const ApplicationFilter = ({
  setDisplayFilter,
  filterParams,
  setFilterParams,
}) => {
  const dispatch = useDispatch();
  const createSearchNode = useRef();
  const [searchParams, setSearchParams] = useState({
    id: filterParams.id || "",
    applicationName: filterParams.applicationName || "",
    applicationStatus: filterParams.applicationStatus || "",
    modified: filterParams.modified || null,
  });
  const applicationStatusOptions = useSelector(
    (state) => state.applications.applicationStatus
  );
  const { t } = useTranslation();
  const handleClick = (e) => {
    if (createSearchNode?.current?.contains(e.target)) {
      return;
    }
    // outside click
    setDisplayFilter(false);
  };

  const closeFilterModal = () =>  setDisplayFilter(false);

  useEffect(() => {
    // add when mounted
    document.addEventListener("mousedown", handleClick);
    // return function to be called when unmounted
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  const handleChange = (key, value) => {
    setSearchParams((prevParams) => ({
      ...prevParams,
      [key]: value,
    }));
  };

  const clearAllFilters = () => {
    dispatch(setApplicationLoading(true));
    setSearchParams({
      id: "",
      applicationName: "",
      applicationStatus: "",
      modified: null,
    });
    dispatch(
      setApplicationListSearchParams({
        id: "",
        applicationName: "",
        applicationStatus: "",
        modified: null,
      })
    );
    setFilterParams({ id: "",
    applicationName: "",
    applicationStatus: "",
    modified: null,});
    closeFilterModal();
  };

  const applyFilters = () => {
    dispatch(setApplicationLoading(true));
    dispatch(setApplicationListActivePage(1));
    setFilterParams(searchParams);
    dispatch(setApplicationListSearchParams(searchParams));
    closeFilterModal();
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

      <div className="m-4 px-2">
        <Row className="mt-2">
          <Col>
            <label>{t("Id")}</label>
            <input
              className="form-control"
              placeholder=""
              value={searchParams.id}
              onChange={(e) => handleChange("id", e.target.value)}
            />
          </Col>
          <Col>
            <label>{t("Form Title")}</label>
            <input
              className="form-control"
              placeholder=""
              value={searchParams.applicationName}
              onChange={(e) => handleChange("applicationName", e.target.value)}
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
              value={searchParams.applicationStatus}
              onChange={(e) => handleChange("applicationStatus", e.target.value)}
              className="form-control p-1"
            >
              <option value=""></option>
              {getApplicationStatusOptions(applicationStatusOptions).map(
                (option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                )
              )}
            </select>
          </Col>
          <Col className="mr-2">
            <label>{t("Modified Date")}</label>
            <DateRangePicker
              onChange={(selectedRange) => {
                handleChange("modified", selectedRange);
              }}
              value={searchParams.modified}
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
        <Col className="px-0 text-left">
          <button
            className="btn btn-link text-danger"
            onClick={clearAllFilters}
          >
            {t("Clear All Filters")}
          </button>
        </Col>
        <Col className="text-right">
          <button
            className="btn btn-link text-dark mr-1 "
            onClick={closeFilterModal}
          >
            {t("Cancel")}
          </button>
          <button className="btn btn-dark" onClick={applyFilters}>
            {t("Show results")}
          </button>
        </Col>
      </Row>
    </div>
  );
};

export default ApplicationFilter;
