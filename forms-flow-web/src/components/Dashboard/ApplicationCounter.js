import React, { Fragment } from "react";
import CardFormCounter from "./CardFormCounter";
import Nodata from "./../Nodata";
const ApplicationCounter = (props) => {
  const {
    application,
    getStatusDetails,
    selectedMEtrixId,
    noOfApplicationsAvailable,
  } = props;

  if (noOfApplicationsAvailable === 0) {
    return (
      <Nodata
        text="No submissions available for the selected date range"
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
          <div className="col-lg-4 col-sm-6 col-xs-12" key={idx}>
            <CardFormCounter
              submitionData={app}
              getStatusDetails={getStatusDetails}
              selectedMEtrixId={selectedMEtrixId}
            />
          </div>
        ))}
      </div>
    </Fragment>
  );
};
export default ApplicationCounter;
