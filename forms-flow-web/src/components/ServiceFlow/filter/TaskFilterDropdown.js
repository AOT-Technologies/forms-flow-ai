import { taskFilters } from "../constants/taskConstants";
import React from "react";

const TaskFilterDropdown = ({ onFilterSelect }) => {
  return (
    <div className="filter-items">
      {taskFilters.map((filter,index) => (
        <div
          key={index}
          className="clickable p-0 mb-2"
          onClick={() => onFilterSelect(filter)}
        >
          {filter}
        </div>
      ))}
    </div>
  );
};

export default TaskFilterDropdown;
