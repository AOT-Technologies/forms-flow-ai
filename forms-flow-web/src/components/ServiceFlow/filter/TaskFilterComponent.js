import React, {useEffect, useRef, useState} from "react";
import TaskFilterDropdown from "./TaskFilterDropdown";
import TaskFilterSearch from "./TaskFilterSearch";
import Checkbox from "@material-ui/core/Checkbox";
import {Filter_Search_Types, QUERY_TYPES} from "../constants/taskConstants";

const TaskFilterComponent = (props) => {
  const {totalTasks} = props;

  const createSearchNode = useRef();
  const [filterSelections, setFilterSelections] = useState([]);
  const [showFilterItems, setShowFilterItems] = useState(false);
  const [queryType, setQueryType] = useState(QUERY_TYPES.ALL);
  const [variableNameIgnoreCase,setVariableNameIgnoreCase] = useState(false);
  const [variableValueIgnoreCase,setVariableValueIgnoreCase] = useState(false);
  const [isVariableTypeInFilter, setIsVariableTypeInFilter] = useState(false);

  const handleClick = e => {
    if (createSearchNode.current.contains(e.target)) {
      return;
    }
    // outside click
    setShowFilterItems(null);
  };

  useEffect(() => {
    // add when mounted
    document.addEventListener("mousedown", handleClick);
    // return function to be called when unmounted
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  useEffect(()=>{
    const isVariablesFilterAvailable = filterSelections.some(filter=>filter.type===Filter_Search_Types.VARIABLES);
    setIsVariableTypeInFilter(isVariablesFilterAvailable);
  },[filterSelections]);

  const setFilter = (filter) => {
    const updatedSelectionsArray = [...filterSelections, {...filter}];
    setFilterSelections(updatedSelectionsArray);
    setShowFilterItems(false);
  };

  const deleteSearchFilter = (filter,index)=>{
    let updatedSelectionsArray = [...filterSelections];
    updatedSelectionsArray.splice(index,1);
    setFilterSelections(updatedSelectionsArray)
  }

  const updateSearchFilterData = (index, key, value)=>{
    let updatedSelectionsArray = [...filterSelections];
    updatedSelectionsArray[index][key]=value;
    setFilterSelections(updatedSelectionsArray);
  }

  const updateFilter = (filter,index)=>{
    let updatedSelectionsArray = [...filterSelections];
    updatedSelectionsArray[index].label=filter.label;
    updatedSelectionsArray[index].type=filter.type;
    updatedSelectionsArray[index].operator=filter.operator;
    setFilterSelections(updatedSelectionsArray);
  }

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

          <TaskFilterSearch updateSearchFilterData={updateSearchFilterData}
                            filterSelections={filterSelections}
                            deleteSearchFilter={deleteSearchFilter}
                            updateFilter={updateFilter}/>
          <div ref={createSearchNode}>
            <input
              type="text"
              className="filter"
              placeholder="Filter Tasks"
              onClick={() => {
              }}
              onFocus={() => setShowFilterItems(true)}
              /*onBlur={() => setShowFilterItems(false)}*/
            />
            {showFilterItems ? (
              <TaskFilterDropdown onFilterSelect={setFilter}/>
            ) : null}
            <span dat-title="Total number of results">{totalTasks}</span>
          </div>


        </div>

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
