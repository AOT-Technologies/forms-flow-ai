import React, { Fragment } from "react";
import CardStatusCounterCard from "./CardStatusCounterCard";
const Dashboard = (props) => {
  return (
    <Fragment>
      <div className="row mt-3">
        <div className="col-12">
          <h3 className="application-title">
            <i className="fa fa-bars mr-1"></i> Application status
          </h3>
        </div>
        <div className="col-lg-4 col-sm-6 col-xs-12">
          <CardStatusCounterCard type="new" title="New " count="5" total="30" />
        </div>
        <div className="col-lg-4 col-sm-6 col-xs-12">
          <CardStatusCounterCard
            type="progress"
            title="New "
            count="10"
            total="30"
          />
        </div>
        <div className="col-lg-4 col-sm-6 col-xs-12">
          <CardStatusCounterCard
            type="completed"
            title="New "
            count="15"
            total="30"
          />
        </div>
      </div>
    </Fragment>
  );
};
export default Dashboard;
