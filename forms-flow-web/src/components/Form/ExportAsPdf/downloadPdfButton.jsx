import React, { useState } from "react";
import { httpGETBlobRequest } from "../../../apiManager/httpRequestHandler";
import API from "../../../apiManager/endpoints";

import { useDownloadFile } from "./useDownloadFile";
import { ExportButton, ButtonState } from "./button";
import { Alert, Container } from "react-bootstrap";
import { replaceUrl } from "../../../helper/helper";
import { Translation } from "react-i18next";
import { withFeature } from "flagged";

const DownloadPDFButton = React.memo(
  ({ form_id, submission_id, title }) => {
    const [buttonState, setButtonState] = useState(ButtonState.Primary);
    const [showAlert, setShowAlert] = useState(false);

    const preDownloading = () => setButtonState(ButtonState.Loading);
    const postDownloading = () => setButtonState(ButtonState.Primary);

    const onErrorDownloadFile = () => {
      setButtonState(ButtonState.Primary);
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    };

    const getFileName = () => {
      return title + "_submission_" + form_id + ".pdf";
    };

    const getClientTimeZone = () => {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;

    };

    const getExporturl = () => {
      let apiUrlExportPdf = replaceUrl(API.EXPORT_FORM_PDF, "<form_id>", form_id);
      apiUrlExportPdf = replaceUrl(
        apiUrlExportPdf,
        "<submission_id>",
        submission_id
      );
      return apiUrlExportPdf;
    };

    const downloadSamplePdfFile = () => {
      const params = { timezone: getClientTimeZone() };
      return httpGETBlobRequest(getExporturl(), params);
    };

    const { ref, url, download, name } = useDownloadFile({
      apiDefinition: downloadSamplePdfFile,
      preDownloading,
      postDownloading,
      onError: onErrorDownloadFile,
      getFileName,
    });

    return (
      <Container className="d-flex flex-column">
        <a href={url} download={name} className="hidden" ref={ref} />
        <ExportButton
          label={<Translation>{(t) => t("Export PDF")}</Translation>}
          labelLoading={<Translation>{(t) => t("Exporting..")}</Translation>}
          buttonState={buttonState}
          onClick={download}
        />
        <Alert variant="danger" show={showAlert}>
         {<Translation>{(t) => t("Something went wrong. Please try again!")}</Translation>}
       </Alert>
      </Container>
    );
  }
);

export default withFeature("exportPdf")(DownloadPDFButton);
