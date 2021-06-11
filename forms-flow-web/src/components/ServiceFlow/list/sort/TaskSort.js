import React from "react";

const TaskSort = React.memo(({handleClick, options}) => {

  const onSortSelect = (sortType) => {
    handleClick(sortType);
  };

  return  (<div className="sort-items">
    {options.map((sortType,index) => (
        <div key={index} className="clickable p-0 mb-2" onClick={() => onSortSelect(sortType)}>
          {sortType.label}
        </div>
      )
    )}
  </div>)
});

export default TaskSort;

