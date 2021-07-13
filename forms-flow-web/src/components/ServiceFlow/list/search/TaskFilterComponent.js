import React, {useEffect, useRef, useState} from "react";
import TaskFilterDropdown from "./TaskFilterDropdown";
import TaskFilterSearch from "./TaskFilterSearch";
import {QUERY_TYPES} from "../../constants/taskConstants";
import {
  setFilterListSearchParams,
  setSearchQueryType
} from "../../../../actions/bpmTaskActions";
import {useDispatch, useSelector} from "react-redux";
import TaskIgnoreCaseComponent from "./TaskIgnoreCaseComponent";

const TaskFilterComponent = React.memo(({totalTasks}) => {
  const createSearchNode = useRef();
  const filterSearchSelections = useSelector(state => state.bpmTasks.filterSearchSelections);
  const queryType = useSelector(state => state.bpmTasks.searchQueryType);
  const [filterSelections, setFilterSelections] = useState(filterSearchSelections);
  const [showFilterItems, setShowFilterItems] = useState(false);
  const dispatch= useDispatch();


  const handleClick = e => {
    if (createSearchNode?.current?.contains(e.target)) {
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
    updatedSelectionsArray[index].key=filter.key;
    setFilterSelections(updatedSelectionsArray);
  }

  const setQueryType=(type)=>{
    dispatch(setSearchQueryType(type));
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
        <TaskIgnoreCaseComponent/>
      </div>
    </>
  );
});

export default TaskFilterComponent;
