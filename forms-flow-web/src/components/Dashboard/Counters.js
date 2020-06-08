import React, { Fragment } from "react";
const Dashboard = (props) => {
  return (
    <Fragment>
      <div className="row mt-3">
        <div className="col-12">
          <h3 className="application-title">
            <i className="fa fa-bars mr-1"></i> Application
          </h3>
        </div>
        <div className="col-lg-4 col-sm-6 col-xs-12">
          <div className="card-counter">
            <div className="white-box analytics-info">
              <h3 className="box-title">
                <i
                  class="fa fa-arrow-circle-o-right mr-1"
                  aria-hidden="true"
                ></i>
                New{" "}
              </h3>
              <div class="progress progress-md">
                <div
                  class="progress-bar bg-success"
                  role="progressbar"
                  style={{ width: "50%" }}
                  aria-valuenow="78"
                  aria-valuemin="0"
                  aria-valuemax="78"
                ></div>
              </div>
              <ul className="list-inline two-part">
                <li>
                  <div>
                    <div className="counter text-success">50</div>
                    <div className="app-title">With Me</div>
                  </div>
                </li>
                <li className="text-right">
                  <i className="ti-arrow-up text-success"></i>
                  <div className="counter text-danger">100</div>
                  <div className="app-title">with Group</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-sm-6 col-xs-12">
          <div className="card-counter">
            <div className="white-box analytics-info">
              <h3 className="box-title">
                {" "}
                <i className="fa fa-clock-o mr-1"></i>In progress
              </h3>
              <div class="progress progress-md">
                <div
                  class="progress-bar bg-danger"
                  role="progressbar"
                  style={{ width: "20%" }}
                  aria-valuenow="78"
                  aria-valuemin="0"
                  aria-valuemax="78"
                ></div>
              </div>
              <ul className="list-inline two-part">
                <li>
                  <div>
                    <div className="counter text-danger">20</div>
                    <div className="app-title">With Me</div>
                  </div>
                </li>
                <li className="text-right">
                  <i className="ti-arrow-up text-danger"></i>
                  <div className="counter text-success">100</div>
                  <div className="app-title">with Group</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-sm-6 col-xs-12">
          <div className="card-counter">
            <div className="white-box analytics-info">
              <h3 className="box-title">
                <i
                  class="fa fa-check-circle  text-success mr-1"
                  aria-hidden="true"
                ></i>{" "}
                completed
              </h3>
              <div class="progress progress-md">
                <div
                  class="progress-bar bg-success"
                  role="progressbar"
                  style={{ width: "80%" }}
                  aria-valuenow="78"
                  aria-valuemin="0"
                  aria-valuemax="78"
                ></div>
              </div>
              <ul className="list-inline two-part">
                <li>
                  <div>
                    <div className="counter text-success">80</div>
                    <div className="app-title">With Me</div>
                  </div>
                </li>
                <li className="text-right">
                  <i className="ti-arrow-up text-success"></i>
                  <div className="counter text-danger">100</div>
                  <div className="app-title">with Group</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
export default Dashboard;
