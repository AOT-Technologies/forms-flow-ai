import React, {useEffect, useState} from "react";
import TaskFilterDropdown from "./TaskFilterDropdown";
import TaskFilterSearch from "./TaskFilterSearch";
import Checkbox from "@material-ui/core/Checkbox";
import {Filter_Search_Types, QUERY_TYPES} from "../constants/taskConstants";

const TaskFilterComponent = (props) => {
  const {totalTasks} = props;

  const [filterSelections, setFilterSelections] = useState([]);
  const [showFilterItems, setShowFilterItems] = useState(false);
  const [queryType, setQueryType] = useState(QUERY_TYPES.ALL);
  const [variableNameIgnoreCase,setVariableNameIgnoreCase] = useState(false);
  const [variableValueIgnoreCase,setVariableValueIgnoreCase] = useState(false);
  const [isVariableTypeInFilter, setIsVariableTypeInFilter] = useState(false);


  useEffect(()=>{
    const isVariablesFilterAvailable = filterSelections.some(filter=>filter.type===Filter_Search_Types.VARIABLES);
    setIsVariableTypeInFilter(isVariablesFilterAvailable);
  },[filterSelections]);

  const setFilter = (filter) => {
    const updatedArray = [...filterSelections, filter];
    setFilterSelections(updatedArray);
    setShowFilterItems(false);
  };

  const changeQueryType= () => {
    queryType===QUERY_TYPES.ALL? setQueryType(QUERY_TYPES.ANY):setQueryType(QUERY_TYPES.ALL);
  };

  return (
    <>
      <div className="filter-container">
        <div>
          {filterSelections.length ?
            <div>
              <span className="button click-element" onClick={changeQueryType}>{queryType}</span>
              <span> of the criteria are met.</span>
            </div> : null}
          <TaskFilterSearch filterSelections={filterSelections}/>
          <input
            type="text"
            className="filter"
            placeholder="Filter Tasks"
            onClick={() => {
            }}
            onFocus={() => setShowFilterItems(true)}
            /*onBlur={() => setShowFilterItems(false)}*/
          />
          <span dat-title="Total number of results">{totalTasks}</span>
        </div>
        {showFilterItems ? (
          <TaskFilterDropdown onFilterSelect={setFilter}/>
        ) : null}
        {filterSelections.length && isVariableTypeInFilter? <div>
          <span className="name-value-container">For Variables, ignore case of
            <Checkbox
              className="check-box-design"
              checked={variableNameIgnoreCase}
              onChange={()=>setVariableNameIgnoreCase(!variableNameIgnoreCase)}
              inputProps={{'aria-label': 'primary checkbox'}}
            />
            name
            <Checkbox
              className="check-box-design"
              checked={variableValueIgnoreCase}
              onChange={()=>setVariableValueIgnoreCase(!variableValueIgnoreCase)}
              inputProps={{'aria-label': 'primary checkbox'}}
            />  value.
          </span>
          {/*<span className="filter-action-container">  <i className="fa fa-link item-pos" aria-hidden="true"/><i
            className="fa fa-floppy-o item-pos" aria-hidden="true"/></span>*/}
        </div> : null}
      </div>
    </>
  );
};

export default TaskFilterComponent;
