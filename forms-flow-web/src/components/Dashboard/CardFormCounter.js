import React, { Fragment } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Translation } from "react-i18next";
import { useSelector } from "react-redux";

const CardFormCounter = React.memo((props) => {
  const { submitionData, getStatusDetails } = props;
  const selectedMetricsId = useSelector(
    (state) => state.metrics?.selectedMetricsId
  );
  const { formName, parentFormId, applicationCount } = submitionData;
  return (
    <Fragment>
      <div
        className="card-counter form-card-counter "
        onClick={() => getStatusDetails(parentFormId, { parentId: true })}
      >
        <div
          className={`white-box analytics-info submission-counter ${
            selectedMetricsId === parentFormId && "active"
          }`}
        >
          <div className="name">
            <div className="d-flex align-items-center">
              <i className="fa-solid fa-file-lines p-1 mr-2" />
              <OverlayTrigger
                placement="top"
                delay={{ show: 0, hide: 400 }}
                overlay={(propsData) => (
                  <Tooltip id="overlay-example" {...propsData}>
                    {formName}
                  </Tooltip>
                )}
              >
                <span className="form-title">{formName}</span>
              </OverlayTrigger>
            </div>

            <div>
              {" "}
              <span className="small-title">
                <Translation>{(t) => t("Form Name")}</Translation>
              </span>
            </div>
          </div>
          <div className="count">
            <div className="counter ">{applicationCount}</div>
            <div className="small-title">
              <Translation>{(t) => t("Total Submissions")}</Translation>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
});

export default CardFormCounter;
