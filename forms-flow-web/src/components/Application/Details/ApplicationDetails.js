import React from "react";
import {Table} from "react-bootstrap";
import startCase from "lodash/startCase";
import {getLocalDateTime} from "../../../apiManager/services/formatterService";
//import {setUpdateLoader} from "../../../actions/taskActions";



const ApplicationDetails = React.memo((props) => {
  const application = props.application;
  return (
    <Table responsive>
      <tbody>
      <tr>
        <td className="border-0">Application Id</td>
        <td className="border-0">:</td>
        <td className="border-0">{application.id}</td>
      </tr>
      <tr>
        <td className="border-0">Application Name</td>
        <td className="border-0">:</td>
        <td className="border-0">{startCase(application.applicationName)}</td>
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
        <td className="border-0">Submitted On</td>
        <td className="border-0">:</td>
        <td className="border-0">
          {getLocalDateTime(application.created)}
        </td>
      </tr>
      <tr>
        <td className="border-0">Modified On</td>
        <td className="border-0">:</td>
        <td className="border-0">
          {getLocalDateTime(application.modified)}
        </td>
      </tr>
      </tbody>
    </Table>
  );
});

export default ApplicationDetails;
