import React, { Fragment } from "react";
import Counters from "./Counters";
const Dashboard = (props) => {
  return (
    <Fragment>
      <div className="dashboard">
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
        </div>
      </div>
    </Fragment>
  );
};
export default Dashboard;
