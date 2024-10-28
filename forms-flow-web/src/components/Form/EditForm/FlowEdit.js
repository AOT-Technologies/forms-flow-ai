import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { CustomButton, HistoryIcon, ConfirmModal } from "@formsflow/components";
import { Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setProcessData } from '../../../actions/processActions.js';
import BpmnEditor from '../../Modeler/Editors/BpmnEditor/index.js';
import { updateProcess } from "../../../apiManager/services/processServices.js";
import { toast } from 'react-toastify';
import { createXMLFromModeler, compareXML, validateProcess } from '../../../helper/processHelper.js';
 
const FlowEdit = forwardRef(({isPublished}, ref) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const bpmnRef = useRef();
  const processData = useSelector((state) => state.process?.processData);
  const [lintErrors, setLintErrors] = useState([]);
  const [historyModalShow, setHistoryModalShow] = useState(false);
  const [savingFlow, setSavingFlow] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  // handle history modal
  const handleHistoryModal = () => setHistoryModalShow(!historyModalShow);
  const handleHanldeDisacardModal = () => setShowDiscardModal(!showDiscardModal);




  const saveFlow = async () => {
    try{
      const bpmnModeler = bpmnRef.current?.getBpmnModeler();
      const xml = await createXMLFromModeler(bpmnModeler);
  
      //if xml is same as existing process data, no need to update
      const isEqual = await compareXML(processData?.processData, xml);
      if (isEqual) {
        toast.success(t("Process updated successfully"));
        return;
      }
      if (!validateProcess(xml,lintErrors)) { //if the validate process is not true
        return;
      }
      setSavingFlow(true);
      const response = await updateProcess({ type:"BPMN", id: processData.id, data:xml });
      dispatch(setProcessData(response.data));
      toast.success(t("Process updated successfully"));
      setSavingFlow(false);
    }catch(error){
      setSavingFlow(false);
      toast.error(t("Failed to update process"));
    }
  };

  //handle discard changes
  const handleDiscardConfirm = ()=>{
    if(bpmnRef.current){
      //import the existing process data to bpmn
      bpmnRef.current?.handleImport(processData?.processData);
      handleHanldeDisacardModal();
    }
};

 

  useImperativeHandle(ref, () => ({
    saveFlow,
  }));

 

  return (
    <Card>
      <ConfirmModal
        show={showDiscardModal}
        title={t(`Are you Sure you want to Discard Flow Changes`) }
        message={t("Are you sure you want to discard all the changes of the Flow?")}
        messageSecondary={t("This action cannot be undone.")}
        primaryBtnAction={handleDiscardConfirm}
        onClose={handleHanldeDisacardModal}
        primaryBtnText={t("Discard Changes")}
        secondaryBtnText={t("Cancel")}
        secondayBtnAction={handleHanldeDisacardModal}
        size="sm"
      />
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
              disabled={isPublished}
              dataTestid="save-flow-layout"
              ariaLabel={t("Save Flow Layout")}
              buttonLoading={savingFlow}
            />
            <CustomButton
              variant="secondary"
              size="md"
              label={t("Discard Changes")}
              onClick={handleHanldeDisacardModal}
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
