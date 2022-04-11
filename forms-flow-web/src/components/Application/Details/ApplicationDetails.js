import React from "react";
import {Table} from "react-bootstrap";
import startCase from "lodash/startCase";
import {getLocalDateTime} from "../../../apiManager/services/formatterService";



const ApplicationDetails = React.memo((props) => {
  const application = props.application;
  return (
    <Table responsive>
      <tbody>
      <tr>
        <td className="border-0">Application Id</td>
        <td className="border-0">:</td>
        <td className="border-0" id="application-id">{application.id}</td>
      </tr>
      <tr>
        <td className="border-0">Application Name</td>
        <td className="border-0">:</td>
        <td className="border-0" id="application-name">{startCase(application.applicationName)}</td>
      </tr>
      <tr>
        <td className="border-0">Created By</td>
        <td className="border-0">:</td>
        <td className="border-0" id="created-by">{application.createdBy}</td>
      </tr>
      <tr>
        <td className="border-0">Application Status</td>
        <td className="border-0">:</td>
        <td className="border-0" id="application-status">{application.applicationStatus}</td>
      </tr>
      <tr>
        <td className="border-0">Submitted On</td>
        <td className="border-0">:</td>
        <td className="border-0" id="application-created">
          {getLocalDateTime(application.created)}
        </td>
      </tr>
      <tr>
        <td className="border-0">Modified On</td>
        <td className="border-0">:</td>
        <td className="border-0" id="application-modified">
          {getLocalDateTime(application.modified)}
        </td>
      </tr>
      </tbody>
    </Table>
  );
});

export default ApplicationDetails;
