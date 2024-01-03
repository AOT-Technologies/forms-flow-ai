import React from "react";
import { useSelector } from "react-redux";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import { HelperServices } from "@formsflow/service";
import { Translation } from "react-i18next";
import { useTranslation } from "react-i18next";
import { getFormUrl } from "../../apiManager/services/formatterService";

const HistoryTable = () => {
  const appHistory = useSelector((state) => state.taskAppHistory.appHistory);
  const { t } = useTranslation();

  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";

  const viewSubmission = (data) => {
    const { formId, submissionId } = data;
    const url = getFormUrl(formId, submissionId, redirectUrl);
    return (
      <button
        data-testid={`submission-details-button-${data.id}`}
        className="btn btn-primary"
        onClick={() => window.open(url, "_blank")}
      >
        <Translation>{(t) => t("View Submission")}</Translation>
      </button>
    );
  };

  const getNoDataIndicationContent = () => {
    return (
      <div className="div-no-application bg-transparent">
        <label className="lbl-no-application">
          {" "}
          <Translation>{(t) => t("No submissions found")}</Translation>{" "}
        </label>
        <br />
          <label className="lbl-no-application-desc">
            {" "}
            <Translation>
              {(t) =>
                t("No History Found")
              }
            </Translation>
          </label>
        <br />
      </div>
    );
  };

  return (
    <>
      <div className="main-header">
        <h3 className="task-head">
          <i className="fa fa-list me-2" aria-hidden="true" />
          &nbsp;<Translation>{(t) => t("Submission History")}</Translation>
        </h3>
      </div>
        <table className="table">
          <thead>
            <tr>
              <th>{t("Status")} </th>
              <th>{t("Created")}</th>
              <th>{t("Submitted By")}</th>
              <th>{t("Submissions")}</th>
            </tr>
          </thead>
          <tbody>
            {appHistory.length ? (
              appHistory?.map((e) => {
                return (
                  <tr key={e.id}>
                    <td>{e.applicationStatus}</td>
                    <td>
                      {HelperServices?.getLocalDateAndTime(e.created)}
                    </td>
                    <td>{e.submittedBy}</td>
                    <td>{viewSubmission(e)}</td>
                  </tr>
                );
              })
            ) : (
              <td colSpan="6" className="text-center">
                {getNoDataIndicationContent()}
              </td>
            )}
          </tbody>
        </table>
    </>
  );
};

export default HistoryTable;
