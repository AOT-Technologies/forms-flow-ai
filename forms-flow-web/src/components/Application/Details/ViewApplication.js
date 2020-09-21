import React from "react";
import {Table} from "react-bootstrap";
import moment from "moment";

//import {setUpdateLoader} from "../../../actions/taskActions";



const ViewApplication = (props) => {
  const application = props.application;
  return (
    <Table responsive>
      <tbody>
      <tr>
        <td className="border-0">Application Name</td>
        <td className="border-0">:</td>
        <td className="border-0">{application.applicationName}</td>
      </tr>
      <tr>
        <td className="border-0">Application Id</td>
        <td className="border-0">:</td>
        <td className="border-0">{application.id}</td>
      </tr>
      <tr>
        <td className="border-0">Created By</td>
        <td className="border-0">:</td>
        <td className="border-0">{application.createdBy}</td>
      </tr>
      <tr>
        <td className="border-0">Application Status</td>
        <td className="border-0">:</td>
        <td className="border-0">{application.applicationStatus}</td>
      </tr>
      <tr>
        <td className="border-0">Created On</td>
        <td className="border-0">:</td>
        <td className="border-0">
          {moment(application.created).format("DD-MMM-YYYY")}
        </td>
      </tr>
      <tr>
        <td className="border-0">Link to form submission</td>
        <td className="border-0">:</td>
        <td className="border-0">{application.formUrl}</td>
        {/*TODO update*/}
      </tr>
      </tbody>
    </Table>
  );
};

export default ViewApplication;
