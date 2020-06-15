import React, { Fragment } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

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

            <OverlayTrigger
              placement="top"
              delay={{ show: 0, hide: 400 }}
              overlay={(propsData) => (
                <Tooltip id="overlay-example" {...propsData}>
                  {formName}
                </Tooltip>
              )}
            >
              <span>{formName}</span>
            </OverlayTrigger>
            <div className="small-title">Form Name</div>
          </div>
          <div className="count">
            <div className="counter ">{count}</div>
            <div className="small-title">Total Submissions</div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
export default CardFormCounter;
