import React, {useState} from "react";
import {FILTER_COMPARE_OPTIONS, Filter_Search_Types} from "../constants/taskConstants";
import OperatorFilterDropDown from "./OperatorFilterDropdown";

const TaskFilterSearch = ({filterSelections = [], deleteSearchFilter, updateSearchFilterData}) => {

  let [valueBoxIndex, setShowValueBoxIndex] = useState(null);
  let [nameBoxIndex, setShowNameBoxIndex] = useState(null);
  let [selectedFilterInputValue, setSelectedFilterInputValue] = useState('');
  let [selectedFilterInputName, setSelectedFilterInputName] = useState('');

  const handleFilterValueChange = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      updateFilterValue(index);
    }
  };

  const updateFilterValue = (index) => {
    updateSearchFilterData( index, 'value', selectedFilterInputValue);
    setShowValueBoxIndex(null);
    setSelectedFilterInputValue('');
  };

  const updateFilterName = (index) => {
    updateSearchFilterData( index, 'name', selectedFilterInputName);
    setShowNameBoxIndex(null);
    setSelectedFilterInputName('');
  };

  const handleFilterNameChange = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      updateFilterName(index);
    }
  };

  const handleValueInput = (index, value = '') => {
    setShowValueBoxIndex(index);
    setSelectedFilterInputValue(value);
  }

  const handleNameInput = (index, value = '') => {
    setShowNameBoxIndex(index);
    setSelectedFilterInputName(value);
  };

  return (
    <>
      {filterSelections.map((filter, index) => (
        <div key={index}>
          <div className="filter-details" key={index}>

            <div className="close-container  click-element" onClick={() => deleteSearchFilter(filter, index)}>
              <span className="close-btn" title={"Remove search"}>
              <i className="fa fa-times" aria-hidden="true"/>
             </span>
            </div>

            <div className="box-container">
              <span className="click-element mr-1" title="Type">{filter.label} {filter.type === Filter_Search_Types.VARIABLES?' :':null}</span>
              <span>
               <span className="btn-container">
               {filter.type === Filter_Search_Types.VARIABLES && nameBoxIndex === index? <>
                 <button className="btn click-element" onClick={() => updateFilterName(index)}>
                   <i className="fa fa-check" aria-hidden="true"/>
                 </button>
                 <button className="btn click-element" onClick={() => setShowNameBoxIndex(null)}>
                   <i className="fa fa-times" aria-hidden="true"/>
                 </button>
               </> : null
               }
               </span>

                {filter.type === Filter_Search_Types.VARIABLES?
                  nameBoxIndex === index ? <input
                    type="text"
                    className="filters"
                    placeholder=""
                    value={selectedFilterInputName}
                    onChange={(e) => setSelectedFilterInputName(e.target.value)}
                    onKeyDown={(e) => handleFilterNameChange(e, index)}
                  />
                  : <span title="Key" className="click-element"
                          onClick={() => handleNameInput(index, filter.name)}>{filter.name ? filter.name : '??'}</span>:null}

                <span className="condition-container">
              {valueBoxIndex === index ? <span className="btn-container second-box">
              {filter.type === Filter_Search_Types.VARIABLES ? <button className="btn">
                <i className="fa fa-calendar" aria-hidden="true"/>
              </button> : null}
                <button className="btn click-element" onClick={() => updateFilterValue(index)}>
              <i className="fa fa-check" aria-hidden="true"/>
            </button>
            <button className="btn click-element" onClick={() => setShowValueBoxIndex(null)}>
              <i className="fa fa-times" aria-hidden="true"/>
            </button>
              </span> : null}

                  <span title="Operator" className="operator-container">
              <OperatorFilterDropDown compareOptions={FILTER_COMPARE_OPTIONS[filter.type]}/>
            </span>
          <span>
              {valueBoxIndex === index ? <input
                  type="text"
                  className="filters"
                  placeholder=""
                  value={selectedFilterInputValue}
                  onChange={(e) => setSelectedFilterInputValue(e.target.value)}
                  onKeyDown={e=>handleFilterValueChange(e,index)}
                />
                : <span title="Value" className="click-element"
                        onClick={() => handleValueInput(index, filter.value)}>{filter.value ? filter.value : '??'}</span>}
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

