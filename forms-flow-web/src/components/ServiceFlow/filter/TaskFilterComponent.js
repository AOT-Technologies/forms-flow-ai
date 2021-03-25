import React, {useState} from "react";
import TaskFilterDropdown from "./TaskFilterDropdown";
import TaskFilterSearch from "./TaskFilterSearch";
import Checkbox from "@material-ui/core/Checkbox";

const TaskFilterComponent = (props) => {
  const {totalTasks} = props;

  const [filterSelections, setFilterSelections] = useState([]);
  const [showFilterItems, setShowFilterItems] = useState(false);

  const setFilter = (filter) => {
    const updatedArray = [...filterSelections, filter];
    setFilterSelections(updatedArray);
    setShowFilterItems(false);
  };
  const handleNameChange = () => {
    return true;
  };

  return (
    <>
      <div className="filter-container">
        <div>
          {filterSelections.length ?
            <div><span className="button" type="button">ALL</span><span> of the criteria are met.</span></div> : null}
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
        {filterSelections.length ? <div>
          <span className="name-value-container">For Variables, ignore case of<Checkbox
            className="check-box-design"
            checked={false}
            onChange={handleNameChange()}
            inputProps={{'aria-label': 'primary checkbox'}}
          />  name<Checkbox
            className="check-box-design"
            checked={false}
            onChange={handleNameChange()}
            inputProps={{'aria-label': 'primary checkbox'}}
          />  value.</span>
          {/*<span className="filter-action-container">  <i className="fa fa-link item-pos" aria-hidden="true"/><i
            className="fa fa-floppy-o item-pos" aria-hidden="true"/></span>*/}
        </div> : null}
      </div>
    </>
  );
};

export default TaskFilterComponent;
