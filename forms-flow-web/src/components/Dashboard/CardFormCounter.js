import React, { Fragment } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Translation,useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const CardFormCounter = React.memo((props) => {
  const {t} = useTranslation();
  const { submitionData, getStatusDetails } = props;
  const selectedMetricsId = useSelector(
    (state) => state.metrics.selectedMetricsId
  );
  const { formName, parentFormId, applicationCount, formVersions } = submitionData;
  const version = formVersions.length && formVersions[formVersions.length - 1]?.version;
  return (
    <Fragment>
      <div
        className=" card-counter form-card-counter "
        onClick={() => getStatusDetails(parentFormId,{parentId:true})}
      >
        <div
          className={`white-box analytics-info submission-counter ${
            selectedMetricsId === parentFormId && "active"
          }`}
        >
          <div className="name">
            <i className="fa fa-wpforms p-1" />

            <OverlayTrigger
              placement="top"
              delay={{ show: 0, hide: 400 }}
              overlay={(propsData) => (
                <Tooltip id="overlay-example" {...propsData}>
                  {formName}{" "}
                  <span style={{ fontSize: "16px" }}>{t("Version")} {version}</span>
                </Tooltip>
              )}
            >
              <span>{formName}</span>
            </OverlayTrigger>
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
