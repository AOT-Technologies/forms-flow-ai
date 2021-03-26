import React from "react";

const handleChange = () =>{
console.log('hiii');
};

const OperatorFilterDropDown = () => {
  return (
    <div className="operator-container">
    <select className="operator-selector"
      onChange={()=>handleChange()}
    >
     <option className="selection-item" value="=">=</option>
     <option className="selection-item" value="!=">!=</option>
      <option className="selection-item" value=">">{'>'}</option>
      <option className="selection-item" value=">=">{'>='}</option>
      <option className="selection-item" value="<">{'<'}</option>
      <option className="selection-item" value="=<">{'=<'}</option>
      <option className="selection-item" value="like">like</option>
    </select>
    </div>
  );
};

export default OperatorFilterDropDown;
