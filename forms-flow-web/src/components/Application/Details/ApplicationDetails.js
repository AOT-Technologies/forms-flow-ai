import React from "react";
import {Table} from "react-bootstrap";
import startCase from "lodash/startCase";
import {getLocalDateTime} from "../../../apiManager/services/formatterService";
import { Translation } from "react-i18next";


//import {setUpdateLoader} from "../../../actions/taskActions";



const ApplicationDetails = React.memo((props) => {
  const application = props.application;
  return (
    <Table responsive>
      <tbody>
      <tr>
        <td className="border-0"><Translation>{(t)=>t("application_id")}</Translation></td>
        <td className="border-0">:</td>
        <td className="border-0">{application.id}</td>
      </tr>
      <tr>
        <td className="border-0"><Translation>{(t)=>t("application_name")}</Translation></td>
        <td className="border-0">:</td>
        <td className="border-0">{startCase(application.applicationName)}</td>
      </tr>
      <tr>
        <td className="border-0"><Translation>{(t)=>t("created_by")}</Translation></td>
        <td className="border-0">:</td>
        <td className="border-0">{application.createdBy}</td>
      </tr>
      <tr>
        <td className="border-0"><Translation>{(t)=>t("application_status")}</Translation></td>
        <td className="border-0">:</td>
        <td className="border-0">{application.applicationStatus}</td>
      </tr>
      <tr>
        <td className="border-0"><Translation>{(t)=>t("submitted_on")}</Translation></td>
        <td className="border-0">:</td>
        <td className="border-0">
          {getLocalDateTime(application.created)}
        </td>
      </tr>
      <tr>
        <td className="border-0"><Translation>{(t)=>t("modified_on")}</Translation></td>
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
