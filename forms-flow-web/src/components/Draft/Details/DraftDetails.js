import React from "react";
import { Table } from "react-bootstrap";
import startCase from "lodash/startCase";
import { getLocalDateTime } from "../../../apiManager/services/formatterService";
import { Translation } from "react-i18next";

const DraftDetails = React.memo((props) => {
  const draft = props.draft;
  return (
    <Table responsive>
      <tbody>
        <tr>
          <td className="border-0">
            <Translation>{(t) => t("Draft Id")}</Translation>
          </td>
          <td className="border-0">:</td>
          <td className="border-0" id="application-id">
            {draft.id}
          </td>
        </tr>
        <tr>
          <td className="border-0">
            <Translation>{(t) => t("Draft Name")}</Translation>
          </td>
          <td className="border-0">:</td>
          <td className="border-0" id="application-name">
            {startCase(draft.DraftName)}
          </td>
        </tr>
        <tr>
          <td className="border-0">
            <Translation>{(t) => t("Created By")}</Translation>
          </td>
          <td className="border-0">:</td>
          <td className="border-0" id="created-by">
            {draft.CreatedBy}
          </td>
        </tr>

        <tr>
          <td className="border-0">
            <Translation>{(t) => t("Submitted On")}</Translation>
          </td>
          <td className="border-0">:</td>
          <td className="border-0" id="application-created">
            {getLocalDateTime(draft.created)}
          </td>
        </tr>
        <tr>
          <td className="border-0">
            <Translation>{(t) => t("Modified On")}</Translation>
          </td>
          <td className="border-0">:</td>
          <td className="border-0" id="application-modified">
            {getLocalDateTime(draft.modified)}
          </td>
        </tr>
      </tbody>
    </Table>
  );
});

export default DraftDetails;
