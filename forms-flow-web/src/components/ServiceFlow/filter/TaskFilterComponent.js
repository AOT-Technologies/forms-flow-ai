import React, { useState } from "react";
import TaskFilterDropdown from "./TaskFilterDropdown";


const TaskFilterComponent = (props)=>{
    const {totalTasks} = props;

    const [filterSelections, setFilterSelections] = useState([]);
    const [showFilterItems, setShowFilterItems] = useState(false);

    const setFilter = (filter) => {
      const updatedArray = [...filterSelections,filter]
      setFilterSelections(updatedArray);
      setShowFilterItems(false);
    };

    return (
      <>
        <div className="filter-container">
          <div className="added-filters">
            {filterSelections.map((filter)=>
            <div>{filter}</div>)}
          </div>

          <div>
            <input type="text"
                   className="filter" placeholder="Filter Tasks"
                   onClick={()=>{}}
                   onFocus={()=>setShowFilterItems(false)}
                   onBlur={()=>setShowFilterItems(false)}/>
            <span title="Total number of results">{totalTasks}</span>
          </div>
         {showFilterItems ?<TaskFilterDropdown onFilterSelect={setFilter}/>:null}
        </div>
      </>
    );
}

export default TaskFilterComponent;
