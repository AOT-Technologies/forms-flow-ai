import React, { Fragment } from "react";
import CardFormCounter from "./CardFormCounter";
import Nodata from "./../Nodata";
import { useTranslation } from "react-i18next";

const ApplicationCounter = React.memo((props) => {
  const { t } = useTranslation();
  const {
    application,
    getStatusDetails,
    selectedMetricsId,
    noOfApplicationsAvailable,
    setSHowSubmissionData,
  } = props;
  if (noOfApplicationsAvailable === 0) {
    return (
      <Nodata
        text={t("No submissions available for the selected date range")}
        className="no-data-submission "
      >
        {" "}
      </Nodata>
    );
  }
  return (
    <Fragment>
      <div className="row">
        {application.map((app, idx) => (
          <div
            className="col-lg-4 col-sm-6 col-xs-12"
            onClick={() => {
              setSHowSubmissionData(app);
            }}
            key={idx}
          >
            <CardFormCounter
              submitionData={app}
              getStatusDetails={getStatusDetails}
              selectedMetricsId={selectedMetricsId}
            />
          </div>
        ))}
      </div>
    </Fragment>
  );
});

export default ApplicationCounter;
