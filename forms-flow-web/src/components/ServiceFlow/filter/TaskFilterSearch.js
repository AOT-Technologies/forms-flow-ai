import React from "react";

const TaskFilterSearch = ({filterSelections=[]}) => {

  return  (
    <>
      {filterSelections.map((filter,index) => (
         <div>
      <div className="filter-details" key={index}>
        <div className="close-container"> <span type="button" className="close-btn">
              <i className="fa fa-times" aria-hidden="true"/>
            </span></div><div className="box-container">

        {filter}

{        <span>
            <span className="btn-container">
            <button className="btn">
              <i className="fa fa-check" aria-hidden="true"/>
            </button>
            <button className="btn">
              <i className="fa fa-times" aria-hidden="true"/>
            </button></span>
            <input type="text" />
            <span className="condition-container">
            <span className="btn-container second-box">
        <button className="btn">
              <i className="fa fa-calendar" aria-hidden="true"/>
            </button>
            <button className="btn">
              <i className="fa fa-check" aria-hidden="true"/>
            </button>
            <button className="btn">
              <i className="fa fa-times" aria-hidden="true"/>
            </button></span>
            <span> = </span>
       {/* <span>like</span>
            <span>in</span>*/}
        <span type="button">??</span><span><input
            type="text"
            className="filters"
            placeholder="Filter Tasks"
            onClick={() => {}}
            /*onBlur={() => setShowFilterItems(false)}*/
          /></span></span>
            </span>}
      </div></div>
      </div>
    ))}
      </>)

};

export default TaskFilterSearch;

