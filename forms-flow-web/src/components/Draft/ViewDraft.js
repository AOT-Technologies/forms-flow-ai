import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import startCase from "lodash/startCase";

import { Tabs, Tab } from "react-bootstrap";
import Details from "./Details";
import Loading from "../../containers/Loading";
import View from "../Form/Item/Submission/Item/View";
import { getForm } from "react-formio";
import NotFound from "../NotFound";
import { Translation, useTranslation } from "react-i18next";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import { fetchAllBpmProcesses } from "../../apiManager/services/processServices";
import { getDraftById } from "../../apiManager/services/draftService";
import { setDraftDetailStatusCode } from "../../actions/draftActions";
import { setDraftDetail } from "../../actions/draftActions";
import ProcessDiagram from "../BPMN/ProcessDiagramHook";

const ViewDraft = React.memo(() => {
  const { t } = useTranslation();
  const { draftId } = useParams();
  const draftDetail = useSelector((state) => state.draft.submission);
  const draftDetailStatusCode = useSelector(
    (state) => state.draft.draftDetailStatusCode
  );
  const isDraftDetailLoading = useSelector(
    (state) => state.draft.isDraftDetailLoading
  );
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const dispatch = useDispatch();
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";

  useEffect(() => {
    dispatch(
      getDraftById(draftId, (err, res) => {
        if (!err) {
          if (res.id && res.formId) {
            dispatch(getForm("form", res.formId));
          }
        }
      })
    );
    return () => {
      dispatch(setDraftDetail({ isDraftDetailLoading: true }));
      dispatch(setDraftDetailStatusCode(""));
    };
  }, [draftId, dispatch]);

  useEffect(() => {
    if (tenantKey) {
      dispatch(fetchAllBpmProcesses());
    }
  }, [dispatch, tenantKey]);

  if (isDraftDetailLoading) {
    return <Loading />;
  }

  if (Object.keys(draftDetail).length === 0 && draftDetailStatusCode === 403) {
    return (
      <NotFound
        errorMessage={t("Access Denied")}
        errorCode={draftDetailStatusCode}
      />
    );
  }

  return (
    <div className="" id="main">
      <div className="d-flex align-items-center">
        <Link data-testid="back-to-drafts-link" title={t("Back to Drafts")} to={`${redirectUrl}draft`} className="mt-1">
          <i className="fa fa-chevron-left fa-lg me-2" />
        </Link>
        <h3 className="">
          <span className="application-head-details">
            <i className="fa fa-list-alt me-2" aria-hidden="true" />
            &nbsp; <Translation>{(t) => t("Drafts")}</Translation> /
          </span>{" "}
          {`${startCase(draftDetail.DraftName)}`}
        </h3>
      </div>
      <br />
      <Tabs id="application-details" defaultActiveKey="details" mountOnEnter>
        <Tab
          data-testid="draft-details-tab"
          eventKey="details"
          title={<Translation>{(t) => t("Details")}</Translation>}
        >
          <Details draft={draftDetail} />
        </Tab>
        <Tab
          data-testid="draft-form-tab"
          eventKey="form"
          title={<Translation>{(t) => t("Form")}</Translation>}
        >
          <View page="draft-detail" showPrintButton={false} />
        </Tab>
        <Tab
          data-testid="draft-process-diagram-tab"
          eventKey="process-diagram"
          title={<Translation>{(t) => t("Process Diagram")}</Translation>}
        >
          <ProcessDiagram
            processKey={draftDetail.processKey}
            tenant={draftDetail?.processTenant}
          />
        </Tab>
      </Tabs>
    </div>
  );
});

export default ViewDraft;
