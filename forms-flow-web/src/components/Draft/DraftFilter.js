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

  const handleChange = (key, value) => {
    setSearchParams((prevParams) => ({
      ...prevParams,
      [key]: value,
    }));
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
  };

  const applyFilters = () => {
    dispatch(setDraftListLoading(true));
    dispatch(setDraftListActivePage(1));
    dispatch(setDraftListSearchParams(searchParams));
    setFilterParams(searchParams);
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
              value={searchParams.id}
              onChange={(e) => handleChange("id", e.target.value)}
            />
          </Col>
          <Col>
            <label>{t("Title")}</label>
            <input
              className="form-control"
              placeholder=""
              value={searchParams.draftName}
              onChange={(e) => handleChange("draftName", e.target.value)}
            />
          </Col>
        </Row>
      </div>
      <hr className="m-0 w-100" />
      <div className="ml-3 d-flex flex-column col-4">
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
          <button className="btn btn-dark" onClick={() => applyFilters()}>
            {t("Show results")}
          </button>
        </Col>
      </Row>
    </div>
  );
};

export default DraftFilter;
