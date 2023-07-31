import React from "react";
import { Table } from "react-bootstrap";
import startCase from "lodash/startCase";
import { Translation } from "react-i18next";
import { HelperServices} from "@formsflow/service";
import { DATE_FORMAT, TIME_FORMAT } from "../../../constants/constants";


const ApplicationDetails = React.memo((props) => {
  const application = props.application;
  return (
    <Table>
      <tbody>
        <tr>
          <td className="border-0">
            <Translation>{(t) => t("Application Id")}</Translation>
          </td>
          <td className="border-0">:</td>
          <td className="border-0" id="application-id">
            {application.id}
          </td>
        </tr>
        <tr>
          <td className="border-0">
            <Translation>{(t) => t("Application Name")}</Translation>
          </td>
          <td className="border-0">:</td>
          <td className="border-0 text-truncate" id="application-name">
            {startCase(application.applicationName)}
          </td>
        </tr>
        <tr>
          <td className="border-0">
            <Translation>{(t) => t("Created By")}</Translation>
          </td>
          <td className="border-0">:</td>
          <td className="border-0" id="created-by">
            {application.createdBy}
          </td>
        </tr>
        <tr>
          <td className="border-0">
            <Translation>{(t) => t("Application Status")}</Translation>
          </td>
          <td className="border-0">:</td>
          <td className="border-0" id="application-status">
            {application.applicationStatus}
          </td>
        </tr>
        <tr>
          <td className="border-0">
            <Translation>{(t) => t("Submitted On")}</Translation>
          </td>
          <td className="border-0">:</td>
          <td className="border-0" id="application-created">
            {HelperServices.getLocalDateAndTime(application.created,DATE_FORMAT,TIME_FORMAT)}
          </td>
        </tr>
        <tr>
          <td className="border-0">
            <Translation>{(t) => t("Modified On")}</Translation>
          </td>
          <td className="border-0">:</td>
          <td className="border-0" id="application-modified">
            {HelperServices.getLocalDateAndTime(application.modified,DATE_FORMAT,TIME_FORMAT)}
          </td>
        </tr>
      </tbody>
    </Table>
  );
});

export default ApplicationDetails;
