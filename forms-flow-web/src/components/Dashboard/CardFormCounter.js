import React, { Fragment } from "react";
const CardFormCounter = (props) => {
  const { submitionData, getStatusDetails, selectedMEtrixId } = props;
  const { formName, mapperId, count } = submitionData;
  return (
    <Fragment>
      <div
        className=" card-counter form-card-counter "
        onClick={() => getStatusDetails(mapperId)}
      >
        <div
          className={`white-box analytics-info submission-counter ${
            selectedMEtrixId === mapperId && "active"
          }`}
        >
          <div className="name">
            <i className="fa fa-wpforms mr-2" aria-hidden="true"></i>
            {formName}
            <div className="small-title">Form Name</div>
          </div>
          <div className="count">
            <div className="counter ">{count}</div>
            <div className="small-title">Total no submissions</div>
          </div>

          {/* <ul className="list-inline two-part">
            <li>
              <div>
                <div className="counter text-purple ">50</div>
                <div className="app-title">With Me</div>
              </div>
            </li>
            <li className="text-right">
              <i className="ti-arrow-up text-purple "></i>
              <div className="counter text-purple ">100</div>
              <div className="app-title text-purple ">with Group</div>
            </li>
          </ul> */}
        </div>
      </div>
    </Fragment>
  );
};
export default CardFormCounter;
