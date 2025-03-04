import React, { useState } from "react";
import { httpPOSTBlobRequest } from "../../../apiManager/httpRequestHandler";
import API from "../../../apiManager/endpoints";
import { toast } from "react-toastify";
import { useDownloadFile } from "./useDownloadFile";
import { Container } from "react-bootstrap";
import { replaceUrl } from "../../../helper/helper";
import { Translation } from "react-i18next";
import { withFeature } from "flagged";
import { CustomButton } from "@formsflow/components";

const DownloadPDFButton = React.memo(({ form_id, submission_id, title }) => {
  const [buttonState, setButtonState] = useState(false);

  const preDownloading = () => setButtonState(true);
  const postDownloading = () => setButtonState(false);

  const onErrorDownloadFile = () => {
    setButtonState(false);
    toast.error(
      <Translation>{(t) => t("Something went wrong. Please try again!")}</Translation>
    );
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
    return httpPOSTBlobRequest(getExporturl(), params, {});
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
      <a href={url} download={name} className="hidden" ref={ref} id="export-btn"/>
      <CustomButton
        variant="light"
        label={<Translation>{(t) => t("Export PDF")}</Translation>}
        onClick={download}
        buttonLoading={buttonState}
        dataTestId="export-pdf-button"
        ariaLabel="Export PDF Button"
        size="sm"
      />
    </Container>
  );
});

export default withFeature("exportPdf")(DownloadPDFButton);
