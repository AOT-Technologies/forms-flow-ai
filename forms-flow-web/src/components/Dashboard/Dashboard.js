import React, { Fragment } from "react";
import ApplicationCounter from "./ApplicationCounter";
import Chart from "./Chart";

const Dashboard = (props) => {
  return (
    <Fragment>
      <div className="dashboard mb-2">
        <div className="row ">
          <div className="col-12">
            <h1 className="dashboard-title">
              <i className="fa fa-home"></i> Application metrics
            </h1>
            <hr className="line-hr"></hr>
          </div>
          <div className="col-12">
            <ApplicationCounter />
          </div>
          <div className="col-12">
            <Chart />
          </div>
          {/* <div className="col-12">
            <ListData />
          </div> */}
        </div>
      </div>
    </Fragment>
  );
};
export default Dashboard;
