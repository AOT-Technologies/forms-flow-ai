import React, {useEffect, useRef, useState} from "react";
import TaskFilterDropdown from "./TaskFilterDropdown";
import TaskFilterSearch from "./TaskFilterSearch";
import Checkbox from "@material-ui/core/Checkbox";
import {QUERY_TYPES} from "../../constants/taskConstants";
import {
  setFilterListSearchParams,
  setIsVariableNameIgnoreCase, setIsVariableValueIgnoreCase,
  setSearchQueryType
} from "../../../../actions/bpmTaskActions";
import {useDispatch, useSelector} from "react-redux";
import {isVariableTypeAvailable} from "../../../../apiManager/services/taskSearchParamsFormatterService";

const TaskFilterComponent = ({totalTasks}) => {
  const createSearchNode = useRef();
  const filterSearchSelections = useSelector(state => state.bpmTasks.filterSearchSelections);
  const queryType = useSelector(state => state.bpmTasks.searchQueryType);
  const variableNameIgnoreCase = useSelector(state => state.bpmTasks.variableNameIgnoreCase);
  const variableValueIgnoreCase = useSelector(state => state.bpmTasks.variableValueIgnoreCase);
  const [filterSelections, setFilterSelections] = useState(filterSearchSelections);
  const [showFilterItems, setShowFilterItems] = useState(false);
  const [isVariableTypeInFilter, setIsVariableTypeInFilter] = useState(false);
  const dispatch= useDispatch();


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
    setIsVariableTypeInFilter(isVariableTypeAvailable(filterSelections));
  },[filterSelections]);

  useEffect(()=>{
    dispatch(setFilterListSearchParams(filterSelections));
  },[filterSelections, dispatch]);


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
    updatedSelectionsArray[index].key=filter.operator;
    setFilterSelections(updatedSelectionsArray);
  }

  const setQueryType=(type)=>{
    dispatch(setSearchQueryType(type));
  }

  const setVariableNameIgnoreCase=(isIgnoreCase)=>{
    dispatch(setIsVariableNameIgnoreCase(isIgnoreCase))
  }

  const setVariableValueIgnoreCase = (isIgnoreCase)=>{
    dispatch(setIsVariableValueIgnoreCase(isIgnoreCase))
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
