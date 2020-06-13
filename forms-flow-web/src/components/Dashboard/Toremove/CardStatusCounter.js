import React, { Fragment } from "react";
const CardFormCounter = (props) => {
  const { type, title, count } = props;
  let btnBg = "bg-yellow";

  if (type === "new") {
    btnBg = "bg-purple";
  } else if (type === "completed") {
    btnBg = "bg-green";
  }
  return (
    <Fragment>
      <div className="d-flex align-items-start border-left-line pb-3">
        <div>
          <div className={`btn  ${btnBg} btn-circle mb-2 btn-item`}>
            {count}
          </div>
        </div>
        <div className="ml-3 mt-2 status-title">
          <h5 className="text-dark font-weight-medium mb-2">{title}</h5>
        </div>
      </div>
    </Fragment>
  );
};
export default CardFormCounter;
