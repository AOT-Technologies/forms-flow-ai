import React, { Fragment } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Translation } from "react-i18next";


const CardFormCounter = React.memo((props) => {
  const { submitionData, getStatusDetails, selectedMetricsId } = props;
  const { formName, mapperId, count ,version } = submitionData;
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
          <i className="fa fa-wpforms p-1" />

            <OverlayTrigger
              placement="top"
              delay={{ show: 0, hide: 400 }}
              overlay={(propsData) => (
                <Tooltip id="overlay-example" {...propsData}>
                  {formName} <span>Version {version}</span>
                </Tooltip>
              )}
            >
              <span>{formName}</span>
            </OverlayTrigger>
            <div className="small-title"><Translation>{(t)=>t("form_name")}</Translation></div>
          </div>
          <div className="count">
            <div className="counter ">{count}</div>
            <div className="small-title"><Translation>{(t)=>t("total_submissions")}</Translation></div>
          </div>
        </div>
      </div>
    </Fragment>
  );
});
export default CardFormCounter;
