import React from "react";


const OperatorFilterDropDown = ({compareOptions}) => {

  const handleChange = (e) =>{
    console.log('hiii', e);
  };
  return (
    <div className="operator-container">
    <select className="operator-selector"
      onChange={(e)=>handleChange(e)}
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
