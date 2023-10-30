import React, { useEffect, useRef } from "react";
import { Col, Row } from "react-bootstrap";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";

const ApplicationFilter = ({ setDisplayFilter }) => {
  const createSearchNode = useRef();

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

  const onSetDateRange = () => {
    console.log(":Sfsd");
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
            <label>Application Id</label>
            <input
              className="form-control"
              placeholder=""
              // value={priority}
              // onChange={(e) => setPriority(e.target.value)}
            />
          </Col>
          <Col>
            <label>Application Name</label>
            <input
              className="form-control"
              placeholder=""
              // value={priority}
              // onChange={(e) => setPriority(e.target.value)}
            />
          </Col>
        </Row>
      </div>
      <hr className="m-0 w-100" />
      <div className="m-4 px-2">
        <Row className="mt-2">
          <Col>
            <label>Application Status</label>
            <input
              className="form-control"
              placeholder=""
              // value={priority}
              // onChange={(e) => setPriority(e.target.value)}
            />
          </Col>
          <Col className="mr-2" style={{ marginTop: "33px" }}>
            <DateRangePicker
              onChange={onSetDateRange}
              dayPlaceholder="dd"
              monthPlaceholder="mm"
              yearPlaceholder="yyyy"
              calendarAriaLabel="Select the date"
              dayAriaLabel="Select the day"
              clearAriaLabel="Clear value"
              clearIcon={null}
              name="selectDateRange"
              monthAriaLabel="Select the month"
              yearAriaLabel="Select the year"
              nativeInputAriaLabel="Date"
            />
          </Col>
        </Row>
      </div>
      <hr className="mx-4" />
      <Row className="m-3 filter-cancel-btn-container ">
        <Col className="text-left">
          <span
            className="text-danger small "
            // onClick={() => clearAllFilters()}
          >
            Clear All Filters
          </span>
        </Col>
        <Col className="text-right">
          <button
            className="btn btn-light mr-1 "
            onClick={() => setDisplayFilter(false)}
          >
            Cancel
          </button>
          <button
            className="btn btn-dark"
            //   onClick={() => applyFilters()}
          >
            Show results
          </button>
        </Col>
      </Row>
    </div>
  );
};

export default ApplicationFilter;
