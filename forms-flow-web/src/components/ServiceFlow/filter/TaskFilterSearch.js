import React from "react";
import {Filter_Search_Types} from "../constants/taskConstants";

const TaskFilterSearch = ({filterSelections = [], deleteSearchFilter}) => {


  const _handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      console.log('we need to hide the text box and show the content');
    }
  };
  return (
    <>
      {filterSelections.map((filter, index) => (
        <div>
          <div className="filter-details" key={index}>
            <div className="close-container  click-element" onClick={()=>deleteSearchFilter(filter,index)}>
              <span className="close-btn">
              <i className="fa fa-times" aria-hidden="true"/>
             </span>
            </div>
            <div className="box-container">
              {filter.label}
              <span>
            <span className="btn-container">
              {filter.type===Filter_Search_Types.VARIABLES?<>
                <button className="btn">
                  <i className="fa fa-check" aria-hidden="true"/>
                </button>
                <button className="btn">
                  <i className="fa fa-times" aria-hidden="true"/>
                </button>
                </>:null
              }
            </span>
                {filter.type===Filter_Search_Types.VARIABLES?<input type="text"/>:""}
            <span className="condition-container">
            <span className="btn-container second-box">
        {filter.type===Filter_Search_Types.VARIABLES?<button className="btn">
              <i className="fa fa-calendar" aria-hidden="true"/>
            </button>:null}
            <button className="btn">
              <i className="fa fa-check" aria-hidden="true"/>
            </button>
            <button className="btn">
              <i className="fa fa-times" aria-hidden="true"/>
            </button></span>
            <span> {filter.option} </span>
              {/* <span>like</span>
            <span>in</span>*/}
              {filter.value?null:<span className="click-element">??</span>}
              <span>
                <input
                  type="text"
                  className="filters"
                  placeholder=""
                  onChange={_handleKeyDown}
                  /*onBlur={() => setShowFilterItems(false)}*/
                />
              </span>
             </span>
             </span>
            </div>
          </div>
        </div>
      ))}
    </>)

};

export default TaskFilterSearch;

