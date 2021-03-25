import React, { useState } from "react";
import TaskFilterDropdown from "./TaskFilterDropdown";
import TaskFilterSearch from "./TaskFilterSearch";

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
        <TaskFilterSearch filterSelections={filterSelections}/>
          <input
            type="text"
            className="filter"
            placeholder="Filter Tasks"
            onClick={() => {}}
            onFocus={() => setShowFilterItems(true)}
            /*onBlur={() => setShowFilterItems(false)}*/
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
