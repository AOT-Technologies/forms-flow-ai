import React, { Fragment } from "react";
import CardFormCounter from "./CardFormCounter";
const ApplicationCounter = (props) => {
  const { application, getStatusDetails, selectedMEtrixId } = props;

  return (
    <Fragment>
      <div className="row">
        {application.map((app) => (
          <div className="col-lg-4 col-sm-6 col-xs-12" key={app.mapperId}>
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
