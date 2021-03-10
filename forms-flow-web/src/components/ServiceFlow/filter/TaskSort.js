import {sortingList} from "../constants/taskConstants";
import React from "react";

const TaskSort = () => {

  const onSortSelect = () => {

  };

  return  (<div className="sort-items">
    {sortingList.map(sortType => (
        <div className="clickable p-0 mb-2" onClick={() => onSortSelect(sortType)}>
          {sortType.label}
        </div>
      )
    )}
  </div>)
};

export default TaskSort;

