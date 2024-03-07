import React, { useEffect, useRef, useState } from "react";
import { Col, Row } from "react-bootstrap";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  setDraftListActivePage,
  setDraftListLoading,
  setDraftListSearchParams,
} from "../../actions/draftActions";

const DraftFilter = ({ setDisplayFilter, filterParams, setFilterParams }) => {
  const dispatch = useDispatch();
  const createSearchNode = useRef();
  const [searchParams, setSearchParams] = useState({
    id: filterParams.id || "",
    draftName: filterParams.draftName || "",
    modified: filterParams.modified || null,
  });

  const { t } = useTranslation();
  const [isSearchParamEntered, setSearchParamEntered] = useState(false);
  const handleClick = (e) => {
    if (createSearchNode?.current?.contains(e.target)) {
      return;
    }
    // outside click
    setDisplayFilter(false);
  };

  const closeFilterModal = ()=> setDisplayFilter(false);

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
    dispatch(setDraftListLoading(true));
    setSearchParams({
      id: "",
      draftName: "",
      modified: null,
    });

    dispatch(
      setDraftListSearchParams({
        id: "",
        draftName: "",
        modified: null,
      })
    );
    setFilterParams({ id: "", draftName: "", modified: null });
    closeFilterModal();
  };

  const applyFilters = () => {
    dispatch(setDraftListLoading(true));
    dispatch(setDraftListActivePage(1));
    dispatch(setDraftListSearchParams(searchParams));
    setFilterParams(searchParams);
    closeFilterModal();
  };

  return (
    <div
      className="appFilter-list-view"
      ref={createSearchNode}
    >
 
      <div className="m-4 px-2">
        <Row className="mt-2">
          <Col>
          <label htmlFor="draftId">{t("Id")}</label>
            <input
              id="draftId"
              className="form-control"
              placeholder=""
              value={searchParams.id}
              onChange={(e) => handleChange("id", e.target.value)}
              data-testid="draft-filter-id-input"
            />
          </Col>
          <Col>
          <label htmlFor="draftTitle">{t("Title")}</label>
            <input
              id="draftTitle"
              className="form-control"
              placeholder=""
              value={searchParams.draftName}
              onChange={(e) => handleChange("draftName", e.target.value)}
              data-testid="draft-filter-draftName-input"
            />
          </Col>
        </Row>
      </div>
      <hr className="m-0 w-100" />
      <div className="m-3 d-flex flex-column col-4">
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
          monthAriaLabel="Select the month"
          yearAriaLabel="Select the year"
          nativeInputAriaLabel="Date"
          data-testid="draft-filter-modified-daterange"
        />
      </div>
      <hr className="mx-4" />
      <Row className="m-3 filter-cancel-btn-container ">
        <Col className="text-left px-0">
          <button
            className="btn btn-link text-danger"
            onClick={clearAllFilters}
            data-testid="draft-filter-clear-button"
          >
            {t("Clear All Filters")}
          </button>
        </Col>
        <Col className="text-right">
          <button
            className="btn btn-link text-dark me-1 "
            onClick={closeFilterModal}
            data-testid="draft-filter-close-button"
          >
            {t("Cancel")}
          </button>
          <button
            className="btn btn-dark"
            onClick={applyFilters}
            disabled={!isSearchParamEntered}
            data-testid="draft-filter-apply-button"
          >
            {t("Show results")}
          </button>
        </Col>
      </Row>
    </div>
  );
};

export default DraftFilter;
