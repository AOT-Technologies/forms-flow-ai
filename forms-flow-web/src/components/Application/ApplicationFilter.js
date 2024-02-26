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

  const [isSearchParamEntered, setSearchParamEntered] = useState(false);

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
    setSearchParams((prevParams) => {
      const updatedParams = {
        ...prevParams,
        [key]: value,
      };
  
      const isAnyParamEntered = Object.values(updatedParams).some(
        (param) => param !== '' && param !== null
      );
  
      setSearchParamEntered(isAnyParamEntered);
      return updatedParams;
    });
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
      className="appFilter-list-view"
      ref={createSearchNode}
    >

      <div className="m-4 px-2">
        <Row className="mt-2">
          <Col>
            <label htmlFor="idInput">{t("Id")}</label>
            <input
              id="idInput"
              className="form-control"
              placeholder=""
              value={searchParams.id}
              onChange={(e) => handleChange("id", e.target.value)}
              data-testid="submission-filter-id-input"
            />
          </Col>
          <Col>
            <label htmlFor="applicationNameInput">{t("Form Title")}</label>
            <input
              id="applicationNameInput"
              className="form-control"
              placeholder=""
              value={searchParams.applicationName}
              onChange={(e) => handleChange("applicationName", e.target.value)}
              data-testid="submission-filter-applicationname-input"
            />
          </Col>
        </Row>
      </div>
      <hr className="m-0 w-100" />
      <div className="m-4 px-2">
        <Row className="mt-2">
          <Col>
            <label htmlFor="applicationStatus">{t("Status")}</label>
            <select
              id="applicationStatus"
              value={searchParams.applicationStatus}
              onChange={(e) => handleChange("applicationStatus", e.target.value)}
              className="form-select p-1 w-100"
              data-testid="submission-filter-applicationstatus-dropdown"
            >
              <option value="" hidden>
                {t("Select a status")}
              </option>
              {getApplicationStatusOptions(applicationStatusOptions).map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    data-testid={`submission-filter-applicationstatus-${option.value}`}>
                    {option.label}
                  </option>
                )
              )}
            </select>
          </Col>
          <Col className="me-2" >
            <label htmlFor="modifiedDateRange" >{t("Modified Date")}</label>
            <DateRangePicker
              id="modifiedDateRange"
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
              monthAriaLabel="Select the month"
              yearAriaLabel="Select the year"
              clearAriaLabel="Click to clear"
              nativeInputAriaLabel="Date"
              data-testid="submission-filter-modified-daterange"
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
            data-testid="submission-filter-clear-button"
          >
            {t("Clear All Filters")}
          </button>
        </Col>
        <Col className="text-right">
          <button
            className="btn btn-link text-dark me-1 "
            onClick={closeFilterModal}
            data-testid="submission-filter-close-button"
          >
            {t("Cancel")}
          </button>
          <button
            className="btn btn-dark"
            onClick={applyFilters}
            disabled={!isSearchParamEntered}
            data-testid="submission-filter-apply-button"
          >
            {t("Show results")}
          </button>
        </Col>
      </Row>
    </div>
  );
};

export default ApplicationFilter;
