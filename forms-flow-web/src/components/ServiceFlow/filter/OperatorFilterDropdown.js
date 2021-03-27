import React from "react";


const OperatorFilterDropDown = ({compareOptions, operator}) => {

  const handleChange = (e) =>{
    console.log('operator selected', e.target.value);
  };
  return (
    <div className="operator-container">
    <select className="operator-selector"
      onChange={handleChange} defaultValue={operator}
    >
      {compareOptions.map((compareOption,index)=>(
        <option key={index} className="selection-item" value={compareOption}>{compareOption}</option>
      ))
      }
    </select>
    </div>
  );
};

export default OperatorFilterDropDown;
