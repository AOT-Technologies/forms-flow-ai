import React, { Fragment } from "react";
import CardFormCounter from "./CardFormCounter";
const ApplicationCounter = (props) => {
  const { application, getStatusDetails, selectedMEtrixId } = props;

  return (
    <Fragment>
      <div className="row">
        {application.map((app) => (
          <div className="col-lg-4 col-sm-6 col-xs-12">
            <CardFormCounter
              submitionData={app}
              getStatusDetails={getStatusDetails}
              selectedMEtrixId={selectedMEtrixId}
            />
          </div>
        ))}
        {/* <div className="col-lg-4 col-sm-6 col-xs-12">
          <CardFormCounter title="form one" count="40" />
        </div>
        <div className="col-lg-4 col-sm-6 col-xs-12">
          <CardFormCounter title="form two" count="50" />
        </div>
        <div className="col-lg-4 col-sm-6 col-xs-12">
          <CardFormCounter title="form three" count="60" />
        </div> */}
      </div>
    </Fragment>
  );
};
export default ApplicationCounter;
