import React, { useState } from "react";
import TaskFilterDropdown from "./TaskFilterDropdown";

const TaskFilterComponent = (props) => {
  const { totalTasks } = props;

  const [filterSelections, setFilterSelections] = useState([]);
  const [showFilterItems, setShowFilterItems] = useState(false);

  const setFilter = (filter) => {
    const updatedArray = [...filterSelections, filter];
    setFilterSelections(updatedArray);
    setShowFilterItems(false);
  };

  return (
    <>
      <div className="filter-container">
        <div>
          {filterSelections.map((filter,index) => (
            <div className="filter-details" key={index}>
              <span type="button" className="close-btn">
              <img src="/webfonts/fa_times.svg" alt="back"/>
            </span>
              Process Definition {{filter}}
              <span> = </span>
              {/* <span>like</span>
            <span>in</span> */}
              <span>??</span>
              {/* <span>
            <button className="btn">
              <i className="fa fa-check" aria-hidden="true"></i>
            </button>
            <button className="btn">
              <i className="fa fa-times" aria-hidden="true"></i>
            </button>
            <input type="text" />
            </span> */}
            </div>
          ))}
          <input
            type="text"
            className="filter"
            placeholder="Filter Tasks"
            onClick={() => {}}
            onFocus={() => setShowFilterItems(false)}
            onBlur={() => setShowFilterItems(false)}
          />
          <span dat-title="Total number of results">{totalTasks}</span>
        </div>
        {showFilterItems ? (
          <TaskFilterDropdown onFilterSelect={setFilter} />
        ) : null}
      </div>
    </>
  );
};

export default TaskFilterComponent;
