import React, { useEffect, useState, useCallback } from 'react';
import BpmnViewer from "bpmn-js/lib/NavigatedViewer"; // Use NavigatedViewer for read-only view with zoom controls
import Nodata from "../Nodata";
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const BPMNViewer = ({ bpmnXml }) => {
  const [viewer, setViewer] = useState(null);
  const { t } = useTranslation();

  const initializeViewer = useCallback(() => {
    setViewer(new BpmnViewer({
      container: "#canvas",
    }));
  }, []);

  const containerRef = useCallback((node) => {
    if (node !== null) initializeViewer();
  }, [initializeViewer]);

  const handleImport = (xml) => {
    if (xml && viewer) {
      viewer.importXML(xml).catch((err) => {
        console.error(err, "BPMN Import Error: ");
      });
    }
  };

  useEffect(() => {
    if (viewer) {
      handleImport(bpmnXml);
    }
  }, [bpmnXml, viewer]);

  if (!bpmnXml) {
    return (
      <div className="bpmn-main-container-editor">
        <div className="bpm-container">
          <Nodata
            text={t("No Process Diagram found")}
            className={"div-no-application-list text-center"}
          />
        </div>
      </div>
    );
  }

  return <div ref={containerRef} id="canvas" style={{ height: '62vh' }}></div>;
};

BPMNViewer.propTypes = {
    bpmnXml: PropTypes.string,
};

export default BPMNViewer;