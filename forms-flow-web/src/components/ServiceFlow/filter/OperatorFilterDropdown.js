import React from "react";


const OperatorFilterDropDown = ({compareOptions, operator}) => {

  const handleChange = (e) =>{
    console.log('operator selected', e.target.value);
  };
  return (
    <select className="operator-selector click-element"
      onChange={handleChange} defaultValue={operator}
    >
      {compareOptions.map((compareOption,index)=>(
        <option key={index} className="selection-item" value={compareOption}>{compareOption}</option>
      ))
      }
    </select>
  );
};

export default OperatorFilterDropDown;
