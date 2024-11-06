import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  CustomButton,
  HistoryIcon,
  ConfirmModal,
  HistoryModal,
} from "@formsflow/components";
import { Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "react-query";
import { setProcessData } from "../../../actions/processActions.js";
import BpmnEditor from "../../Modeler/Editors/BpmnEditor/index.js";
import LoadingOverlay from "react-loading-overlay-ts";
import {
  updateProcess,
  getProcessHistory,
  fetchRevertingProcessData,
} from "../../../apiManager/services/processServices.js";
import { toast } from "react-toastify";
import {
  createXMLFromModeler,
  compareXML,
  validateProcess,
} from "../../../helper/processHelper.js";
import PropTypes from "prop-types";

const FlowEdit = forwardRef(({ isPublished = false, CategoryType }, ref) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const bpmnRef = useRef();
  const processData = useSelector((state) => state.process?.processData);
  const [lintErrors, setLintErrors] = useState([]);
  const [savingFlow, setSavingFlow] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isReverted, setIsReverted] = useState(false);
  /* --------- fetching all process history when click history button --------- */
  const {
    data: { data: historiesData } = {}, // response data destructured
    mutate: fetchHistories, // mutate function used to call the api function and here mutate renamed to fetch histories
    // isLoading: historiesLoading,
    // isError: historiesError,
  } = useMutation(
    ({ parentProcessKey, page, limit }) =>
      getProcessHistory({ parentProcessKey, page, limit }) // this is api calling function and mutate function accepting some parameter and passing to the apicalling function
  );

  /* --------- fetch a perticular history when click the revert button -------- */
  const {
    data: { data: historyData } = {},
    mutate: fetchHistoryData,
    isLoading: historyLoading,
    // isError: historyDataError,
  } = useMutation((processId) => fetchRevertingProcessData(processId), {
    onSuccess: () => {
      setIsReverted(true);
    },
  });

  const handleDiscardModal = () => setShowDiscardModal(!showDiscardModal);
  const handleToggleHistoryModal = () => setShowHistoryModal(!showHistoryModal);

  //handle discard changes
  const handleDiscardConfirm = () => {
    if (bpmnRef.current) {
      //import the existing process data to bpmn
      bpmnRef.current?.handleImport(processData?.processData); 
      isReverted && setIsReverted(!isReverted); //once it reverted then need to make it false
      handleDiscardModal();
    }
  };

  const handleProcessHistory = () => {
    handleToggleHistoryModal();
    fetchHistories({
      parentProcessKey: processData.parentProcessKey, // passing process key to get histories data
      page: 1,
      limit: 4,
    });
  };

  const loadMoreBtnAction = () => {
    fetchHistories({ parentProcessKey: processData.parentProcessKey });
  };

  

  const saveFlow = async (showToast = true) => {
    try {
      const bpmnModeler = bpmnRef.current?.getBpmnModeler();
      const xml = await createXMLFromModeler(bpmnModeler);
      if (!validateProcess(xml, lintErrors, t)) {
        return;
      }
      //if xml is same as existing process data, no need to update
      const isEqual = await compareXML(processData?.processData, xml);
      if (isEqual && !isReverted) {
        showToast && toast.success(t("Process updated successfully"));
        return;
      }

      setSavingFlow(true);
      const response = await updateProcess({
        type: "BPMN",
        id: processData.id,
        data: xml,
      });
      dispatch(setProcessData(response.data));
      isReverted && setIsReverted(!isReverted); //if it already reverted the need to make it false
      showToast && toast.success(t("Process updated successfully"));
    } catch (error) {
      toast.error(t("Failed to update process"));
    } finally {
      setSavingFlow(false);
    }
  };

  useImperativeHandle(ref, () => ({
    saveFlow,
  }));


  return (
    <>
      <Card>
        <ConfirmModal
          show={showDiscardModal}
          title={t(`Are you Sure you want to Discard Flow Changes`)}
          message={t(
            "Are you sure you want to discard all the changes of the Flow?"
          )}
          messageSecondary={t("This action cannot be undone.")}
          primaryBtnAction={handleDiscardConfirm}
          onClose={handleDiscardModal}
          primaryBtnText={t("Discard Changes")}
          secondaryBtnText={t("Cancel")}
          secondayBtnAction={handleDiscardModal}
          size="sm"
        />
        <Card.Header>
          <div
            className="d-flex justify-content-between align-items-center w-100"
          >
            <div className="d-flex align-items-center justify-content-between">
              <div className="mx-2 builder-header-text">{t("Flow")}</div>
              <div>
                <CustomButton
                  variant="secondary"
                  size="md"
                  icon={<HistoryIcon />}
                  label={t("History")}
                  onClick={handleProcessHistory}
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
                onClick={handleDiscardModal}
                dataTestid="discard-flow-changes-testid"
                ariaLabel={t("Discard Flow Changes")}
              />
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <LoadingOverlay
            active={historyLoading}
            spinner
            text={t("Loading...")}
          >
            <BpmnEditor
              ref={bpmnRef}
              setLintErrors={setLintErrors}
              bpmnXml={
                isReverted ? historyData?.processData : processData?.processData
              }
            />
          </LoadingOverlay>
        </Card.Body>
      </Card>
      <HistoryModal
        show={showHistoryModal}
        onClose={handleToggleHistoryModal}
        title={t("History")}
        loadMoreBtnText={t("Load More")}
        revertBtnText={t("Revert To This")}
        allHistory={historiesData?.processHistory || []}
        loadMoreBtnAction={loadMoreBtnAction}
        categoryType={CategoryType.WORKFLOW}
        revertBtnAction={fetchHistoryData}
        historyCount={historiesData?.totalCount || 0}
        currentVersionId={processData.id}
      />
    </>
  );
});

FlowEdit.propTypes = {
  CategoryType: PropTypes.shape({
    WORKFLOW: PropTypes.string.isRequired,
  }).isRequired,
  isPublished: PropTypes.bool.isRequired,
};

export default FlowEdit;
