import React from "react";


const OperatorFilterDropDown = ({compareOptions, operator}) => {

  const handleChange = (e) =>{
    console.log('operator selected', e.target.value);
  };
  return (
    <div className="operator-container">
    <select className="operator-selector"
      onChange={handleChange} value={operator}
    >
      {compareOptions.map(compareOption=>(
        <option className="selection-item" value={compareOption}>{compareOption}</option>
      ))
      }
    </select>
    </div>
  );
};

export default OperatorFilterDropDown;
