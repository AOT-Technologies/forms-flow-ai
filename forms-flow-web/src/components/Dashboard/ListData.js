import React, { Fragment } from "react";
const ListData = (props) => {
  return (
    <Fragment>
      {/* <div className="row mt-3"> */}
      {/* <div className="col-12">
          <h3 className="application-title">
            <i className="fa fa-list mr-1"></i>Latest 5 unassigned applciations
          </h3>
        </div> */}
      {/* <div className="col-lg-12 col-sm-12"> */}
      {/* <div className="card-counter">
        <div className="white-box analytics-info"> */}
      <h3 className="">Latest 5 unassigned forms</h3>
      <table class="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Name</th>
            <th scope="col">Assiged to </th>
            <th scope="col">date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">1</th>
            <td>Form</td>
            <td>use1</td>
            <td>10 jun 2020</td>
          </tr>
          <tr>
            <th scope="row">2</th>
            <td>Form</td>
            <td>use1</td>
            <td>10 jun 2020</td>
          </tr>
          <tr>
            <th scope="row">3</th>
            <td>Form</td>
            <td>use1</td>
            <td>10 jun 2020</td>
          </tr>
          <tr>
            <th scope="row">4</th>
            <td>Form</td>
            <td>use1</td>
            <td>10 jun 2020</td>
          </tr>
          <tr>
            <th scope="row">5</th>
            <td>Form</td>
            <td>use1</td>
            <td>10 jun 2020</td>
          </tr>
        </tbody>
      </table>
      {/* </div> */}
      {/* </div> */}
      {/* </div> */}
      {/* <div className="col-lg-6 col-sm-12">
          <div className="card-counter">
            <div className="white-box analytics-info">
              <h3 className="">Latest 5 unassigned task</h3>
              <table class="table">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">First</th>
                    <th scope="col">Last</th>
                    <th scope="col">Handle</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">1</th>
                    <td>Mark</td>
                    <td>Otto</td>
                    <td>@mdo</td>
                  </tr>
                  <tr>
                    <th scope="row">2</th>
                    <td>Jacob</td>
                    <td>Thornton</td>
                    <td>@fat</td>
                  </tr>
                  <tr>
                    <th scope="row">3</th>
                    <td>Larry</td>
                    <td>the Bird</td>
                    <td>@twitter</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div> */}
      {/* </div> */}
    </Fragment>
  );
};
export default ListData;
