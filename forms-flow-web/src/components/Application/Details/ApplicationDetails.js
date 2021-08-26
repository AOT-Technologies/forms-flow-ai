import React from "react";
import {Table} from "react-bootstrap";
import startCase from "lodash/startCase";
import {getLocalDateTime} from "../../../apiManager/services/formatterService";
import { Trans } from "react-i18next";


//import {setUpdateLoader} from "../../../actions/taskActions";



const ApplicationDetails = React.memo((props) => {
  const application = props.application;
  return (
    <Table responsive>
      <tbody>
      <tr>
        <td className="border-0"><Trans>{("application_id")}</Trans></td>
        <td className="border-0">:</td>
        <td className="border-0">{application.id}</td>
      </tr>
      <tr>
        <td className="border-0"><Trans>{("application_name")}</Trans></td>
        <td className="border-0">:</td>
        <td className="border-0">{startCase(application.applicationName)}</td>
      </tr>
      <tr>
        <td className="border-0"><Trans>{("created_by")}</Trans></td>
        <td className="border-0">:</td>
        <td className="border-0">{application.createdBy}</td>
      </tr>
      <tr>
        <td className="border-0"><Trans>{("application_status")}</Trans></td>
        <td className="border-0">:</td>
        <td className="border-0">{application.applicationStatus}</td>
      </tr>
      <tr>
        <td className="border-0"><Trans>{("submitted_on")}</Trans></td>
        <td className="border-0">:</td>
        <td className="border-0">
          {getLocalDateTime(application.created)}
        </td>
      </tr>
      <tr>
        <td className="border-0"><Trans>{("modified_on")}</Trans></td>
        <td className="border-0">:</td>
        <td className="border-0">
          {getLocalDateTime(application.modified)}
        </td>
      </tr>
      </tbody>
    </Table>
  );
});
console.log("application details loaded"+Trans)

export default ApplicationDetails;
