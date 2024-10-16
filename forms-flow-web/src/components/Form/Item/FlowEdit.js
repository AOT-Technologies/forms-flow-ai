import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { CustomButton, HistoryIcon } from "@formsflow/components";
import { Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setProcessData } from '../../../actions/processActions.js';
import BpmnEditor from '../../Modeler/Editors/BpmnEditor/index.js';
import { updateProcess } from "../../../apiManager/services/processServices.js";
import { toast } from 'react-toastify';
import { createXMLFromModeler, validateProcessNames, compareXML } from '../../../helper/processHelper.js';
import { ERROR_LINTING_CLASSNAME } from '../../Modeler/constants/bpmnModelerConstants.js';

const FlowEdit = forwardRef((_, ref) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const bpmnRef = useRef();
  const processData = useSelector((state) => state.process?.processData);
  const [lintErrors, setLintErrors] = useState([]);
  const [historyModalShow, setHistoryModalShow] = useState(false);
 
  // handle history modal
  const handleHistoryModal = () => setHistoryModalShow(!historyModalShow);

  //validate any erros in bpmn lint
  const validateBpmnLintErrors = () => {
    // only return false if there are errors, warnings are ok
    let hasErrors = false;

    for (const key in lintErrors) {
      const err = lintErrors[key];
      err.forEach((x) => {
        // Only toast errors, not warnings
        if (x.category === "error") {
          hasErrors = true;
          toast.error(t(x.message));
        }
      });
    }
    return hasErrors ? false : true;
  };

  // validate the xml data and any erros in bpmn lint
  const validateProcess = (xml) => {
    if (document.getElementsByClassName(ERROR_LINTING_CLASSNAME).length > 0) {
      return validateBpmnLintErrors();
    }
    if (!validateProcessNames(xml)) {
      toast.error(t("Process name(s) must not be empty"));
      return false;
    }
    return true;
  };



  const saveFlow = async () => {
    const bpmnModeler = bpmnRef.current?.getBpmnModeler();
    const xml = await createXMLFromModeler(bpmnModeler);

    //if xml is same as existing process data, no need to update
    const isEqual = await compareXML(processData?.processData, xml);
    if (isEqual) {
      toast.success(t("Process updated successfully"));
      return;
    }
    if (!validateProcess(xml)) {
      return;
    }
    
    updateProcess({ type:"BPMN", id: processData.id, data:xml }).then((response) => {
      dispatch(setProcessData(response.data));
      toast.success(t("Process updated successfully"));
    });
  };

  //handle discard changes
  const handleDiscard = ()=>{
    if(bpmnRef.current){
      //import the existing process data to bpmn
      bpmnRef.current?.handleImport(processData?.processData);
    }
};

  useImperativeHandle(ref, () => ({
    saveFlow,
  }));

  return (
    <Card>

      <Card.Header>
        <div className="d-flex justify-content-between align-items-center" style={{ width: "100%" }}>
          <div className="d-flex align-items-center justify-content-between">
            <div className="mx-2 builder-header-text">Flow</div>
            <div>
              <CustomButton
                variant="secondary"
                size="md"
                icon={<HistoryIcon />}
                label={t("History")}
                onClick={handleHistoryModal}
                dataTestid="flow-history-button-testid"
                ariaLabel={t("Flow History Button")}
              />
              <CustomButton
                variant="secondary"
                size="md"
                className="mx-2"
                label={t("Preview & Variables")}
                onClick={() => console.log("handlePreviewAndVariables")}
                dataTestid="preview-and-variables-testid"
                ariaLabel={t("{Preview and Variables Button}")}
              />
              
            </div>
          </div>
          <div>
            <CustomButton
              variant="primary"
              size="md"
              className="mx-2"
              label={t("Save Flow")}
              onClick={saveFlow}
              dataTestid="save-flow-layout"
              ariaLabel={t("Save Flow Layout")}
            />
            <CustomButton
              variant="secondary"
              size="md"
              label={t("Discard Changes")}
              onClick={handleDiscard}
              dataTestid="discard-flow-changes-testid"
              ariaLabel={t("Discard Flow Changes")}
            />
          </div>
        </div>
      </Card.Header>
      <Card.Body>
      <BpmnEditor ref={bpmnRef} setLintErrors={setLintErrors}
             bpmnXml={processData?.processData} />
      </Card.Body>
    </Card>
  );
});

export default FlowEdit;
