import React, { Fragment } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const CardFormCounter = (props) => {
  const { submitionData, getStatusDetails, selectedMetricsId } = props;
  const { formName, mapperId, count } = submitionData;
  return (
    <Fragment>
      <div
        className=" card-counter form-card-counter "
        onClick={() => getStatusDetails(mapperId)}
      >
        <div
          className={`white-box analytics-info submission-counter ${
            selectedMetricsId === mapperId && "active"
          }`}
        >
          <div className="name">
            <img src="/form.svg" width="30" height="30" alt="form" />

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
