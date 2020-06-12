import React, { Fragment } from "react";
import CardStatusCounter from "./CardStatusCounter";

const Dashboard = (props) => {
  return (
    <Fragment>
      <div className="status-counter">
        <div className="card-counter">
          <div class="white-box ">
            <div class="card-body">
              <h4 class="card-title">
                {" "}
                <i className="fa fa-bars mr-1"></i> Submission status - form 1
              </h4>
              <div className="mt-4 stataus-progress">
                <CardStatusCounter type="new" title="New " count="40" />
                <CardStatusCounter title="In progress " count="20" />
                <CardStatusCounter title="Some status " count="60" />
                <CardStatusCounter
                  type="completed"
                  title="Completed "
                  count="100"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
export default Dashboard;
