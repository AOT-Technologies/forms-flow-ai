import React from "react";


const OperatorFilterDropDown = React.memo(({compareOptions, operator, changeOperator}) => {

  const handleChange = (e) =>{
    changeOperator(e.target.value);
  };
  return (
    <select className="operator-selector click-element"
      onChange={handleChange} value={operator}
    >
      {compareOptions.map((compareOption,index)=>(
        <option key={index} className="selection-item" value={compareOption}>{compareOption}</option>
      ))
      }
    </select>
  );
});

export default OperatorFilterDropDown;
