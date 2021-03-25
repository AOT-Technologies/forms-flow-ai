import React from "react";

const TaskFilterSearch = ({filterSelections=[]}) => {

  return  (
    <>
      {filterSelections.map((filter,index) => (
      <div className="filter-details" key={index}>
              <span type="button" className="close-btn">
              <i className="fa fa-times" aria-hidden="true"/>
            </span>
        {filter}
        <span> = </span>
       {/* <span>like</span>
            <span>in</span>*/}
        <span>??</span>
{/*        <span>
            <button className="btn">
              <i className="fa fa-check" aria-hidden="true"/>
            </button>
            <button className="btn">
              <i className="fa fa-times" aria-hidden="true"/>
            </button>
            <input type="text" />
            </span>*/}
      </div>
    ))}
      </>)

};

export default TaskFilterSearch;

