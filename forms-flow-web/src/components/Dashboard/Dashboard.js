import React, { Fragment } from "react";
import Counters from "./Counters";
import Chart from "./Chart";

const Dashboard = (props) => {
  return (
    <Fragment>
      <div className="dashboard mb-2">
        <div className="row ">
          <div className="col-12">
            <h1 className="dashboard-title">
              <i className="fa fa-home"></i> My Dashboard
            </h1>
            <hr className="line-hr"></hr>
          </div>
          <div className="col-12">
            <Counters />
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
