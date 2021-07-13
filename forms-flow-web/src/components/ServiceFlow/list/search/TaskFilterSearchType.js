import React, {useEffect, useRef, useState} from "react";
import {Filter_Search_Types} from "../../constants/taskConstants";
import TaskFilterDropdown from "./TaskFilterDropdown";


const TaskFilterSearchType = React.memo(({filter, index, handleFilterUpdate}) => {
  const createSearchNode = useRef();
  const [showFilterItems, setShowFilterItems]= useState(false);

  const handleClick = e => {
    if (createSearchNode?.current?.contains(e.target)) {
      return;
    }
    // outside click
    setShowFilterItems(false);
  };

  useEffect(() => {
    // add when mounted
    document.addEventListener("mousedown", handleClick);
    // return function to be called when unmounted
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  const handleFilterSelect = (filterToUpdate) => {
    handleFilterUpdate(filterToUpdate,index);
    setShowFilterItems(false);
  };

  return (
    <span className="click-element mr-1 list-span" title="Type"  ref={createSearchNode}>
      <span onClick={()=>setShowFilterItems(true)}>{filter.label} {filter.type === Filter_Search_Types.VARIABLES?' :':null}</span>
      {showFilterItems?<TaskFilterDropdown onFilterSelect={handleFilterSelect}/>:null}
              </span>)

})

export default TaskFilterSearchType;
