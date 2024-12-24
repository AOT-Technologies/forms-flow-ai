import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect
} from "react";
import {
  CustomButton,
  HistoryIcon,
  ConfirmModal,
  HistoryModal,
  CurlyBracketsIcon,
} from "@formsflow/components";
import { Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "react-query";
import { setProcessData } from "../../../actions/processActions.js";
import BpmnEditor from "../../Modeler/Editors/BpmnEditor/BpmEditor";
import LoadingOverlay from "react-loading-overlay-ts";
import { push } from "connected-react-router";
import { processMigrate } from "../../../apiManager/services/FormServices";
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
import userRoles from "../../../constants/permissions.js";
import BPMNViewer from "../../BPMN/BpmnViewer.js";
import TaskVariableModal from "../../Modals/TaskVariableModal.js";

const FlowEdit = forwardRef(({ isPublished = false, CategoryType,
  setWorkflowIsChanged, migration, setMigration, redirectUrl,
  isMigrated = true, mapperId,layoutNotsaved, handleCurrentLayout,
  isMigrationLoading, setIsMigrationLoading  }, ref) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const bpmnRef = useRef();
  const processData = useSelector((state) => state.process?.processData);
  const [lintErrors, setLintErrors] = useState([]);
  const [savingFlow, setSavingFlow] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isReverted, setIsReverted] = useState(false);
  const { createDesigns } = userRoles();
  const [showTaskVarModal, setShowTaskVarModal] = useState(false);
  const [isWorkflowChanged, setIsWorkflowChanged] = useState(false);
  const [isMigrationChecked, setIsMigrationChecked] = useState(false);
  const [showMigrationModal, setShowMigrationModal] = useState(false);
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
        enableWorkflowChange();
      },
    });

    const handleDiscardModal = () => setShowDiscardModal(!showDiscardModal);
    const handleToggleHistoryModal = () =>
      setShowHistoryModal(!showHistoryModal);

    const enableWorkflowChange = () => {
      setIsWorkflowChanged(true);
      setWorkflowIsChanged(true); // this function passed from parent
    };

    const disableWorkflowChange = () => {
      setIsWorkflowChanged(false);
      setWorkflowIsChanged(false); // this function passed from parent
    };

    useEffect(() => {
    if (migration) {
      setShowMigrationModal(true);
      setMigration(false);
    }
  }, [migration]);

  const handleMigration = () => {
    setIsMigrationLoading(true);
    const migrationData = {
      mapperId: mapperId,
      processKey: processData.processKey
    };
    processMigrate(migrationData)
      .then(() => {
        dispatch(push(`${redirectUrl}formflow`));
      })
      .catch((err) => {
        setIsMigrationLoading(false); // this is not added in finally as this props value is used for overriding navigation blocker during routing
        console.log(err);
      })
      .finally(() => {
        setShowMigrationModal(false);
      });
  };
  //handle discard changes
    const handleDiscardConfirm = () => {
      if (bpmnRef.current) {
        //import the existing process data to bpmn
        bpmnRef.current?.handleImport(processData?.processData);
        isReverted && setIsReverted(!isReverted); //once it reverted then need to make it false
        disableWorkflowChange();
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
  const handleSaveFlowClick = () => {
    //On clicking the save flow it checks if the current flow has already been migrated, if not, it tries to migrate first.
    if (shouldShowMigrationModal()) {
      setShowMigrationModal(true);
    } else {
      saveFlow();
    }
  };
  const shouldShowMigrationModal = () => {
    return !isMigrated;
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
          disableWorkflowChange();
          return;
        }

        setSavingFlow(true);
        const response = await updateProcess({
          type: "BPMN",
          id: processData.id,
          data: xml,
        });
        dispatch(setProcessData(response.data));
        disableWorkflowChange();
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
      handleImport: (xml) => {
        bpmnRef.current?.handleImport(xml);
      },
    }));
    const handlePreviewAndVariables = () => {
      setShowTaskVarModal(true);
    };
    const CloseTaskVarModal = () => {
      setShowTaskVarModal(false);
    };

    const handleCloseMigration = () => {
    setShowMigrationModal(false);
  };return (
      <>
        <Card>
          <ConfirmModal
            show={showDiscardModal}
            title={t(`Discard Flow Changes?`)}
            message={t(
              "Are you sure you want to discard all unsaved changes to the flow of the form?"
            )}
            messageSecondary={t("This action cannot be undone.")}
            primaryBtnAction={handleDiscardConfirm}
            onClose={handleDiscardModal}
            primaryBtnText={t("Yes, Discard All Unsaved Changes")}
            secondaryBtnText={t("No, Keep The Changes")}
            secondayBtnAction={handleDiscardModal}
            size="sm"
          />
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center w-100">
              <div className="d-flex align-items-center justify-content-between">
                <div className="mx-2 builder-header-text">{t("Flow")}</div>
                {createDesigns && (
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
                      icon={<CurlyBracketsIcon />}
                      label={t("Variables")}
                      onClick={() => handlePreviewAndVariables()}
                      dataTestid="preview-and-variables-testid"
                      ariaLabel={t("{Preview and Variables Button}")}
                    />
                  </div>
                )}
              </div>
              {createDesigns && (
                <div>
                  <CustomButton
                    variant="primary"
                    size="md"
                    className="mx-2"
                    label={t("Save Flow")}
                    onClick={handleSaveFlowClick}
                    disabled={isPublished || !isWorkflowChanged}
                    dataTestid="save-flow-layout"
                    ariaLabel={t("Save Flow Layout")}
                    buttonLoading={savingFlow}
                  />
                  <CustomButton
                    variant="secondary"
                    size="md"
                    label={t("Discard Changes")}
                    onClick={handleDiscardModal}
                    disabled={!isWorkflowChanged}
                    dataTestid="discard-flow-changes-testid"
                    ariaLabel={t("Discard Flow Changes")}
                  />
                </div>
              )}
            </div>
          </Card.Header>
          <Card.Body>
            <LoadingOverlay
              active={historyLoading}
              spinner
              text={t("Loading...")}
            >
              <div className="flow-builder">
                {!createDesigns ? (
                  <BPMNViewer bpmnXml={processData?.processData || null} />
                ) : (
                  <BpmnEditor
                    onChange={enableWorkflowChange} //handled is workflow changed or not
                    ref={bpmnRef}
                    setLintErrors={setLintErrors}
                    bpmnXml={
                      isReverted
                        ? historyData?.processData
                        : processData?.processData
                    }
                  />
                )}
              </div>
            </LoadingOverlay>
          </Card.Body>
        </Card>
        {showMigrationModal && <ConfirmModal
        show={showMigrationModal}
        title={t("***Migration Notice***")}
        message={
          <div>
            <div className="message-primary mb-3">
              {t(`We have switched to a new 1-to-1 relationship structure,
              where 1 form contains both the layout (visual of the form)
               and the flow (the actions that get executed after the
               form's submission). Due to this 1-to-1 relationship,
               each layout (previously known as "form") will have a
               flow associated with it, so you cannot reuse flows -
                one flow cannot be executed by different forms.`)}
            </div>
            <div className="message-primary mb-3">
              {t(`This form shares a flow with a few other forms. As this is
               not allowed under the new structure, we will permanently
                link this flow with this form. For the other forms reusing
                 this flow, we will automatically duplicate the flow. When
                 flows are duplicated, their history is not carried over.
                 You need to pick which form keeps the history and which
                 forms get duplicates without history.`)}
            </div>
            <div className="message-primary mb-3">
              {t(`If this is the form you wish to keep the flow's history with,
               confirm below. If this is not the form, then hit cancel, find
                the form you want, make a minor change, press "Save Layout"
                 or "Save Flow," and confirm it there.`)}
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <label className="message-primary">
                {t(`This is the form that will keep the current
                flow and its history.`)}
                {" "}
              </label>
              <div className="dashed-line"></div>
              <div className="custom-checkbox d-flex justify-content-between align-items-center gap-2">
                <input
                  type="checkbox"
                  className="form-check-input mb-2"
                  onChange={() => setIsMigrationChecked(prev => !prev)}
                  data-testid="migration-confirm"
                  checked={isMigrationChecked}
                />
                <label className="message-primary">{t(`I confirm`)}</label>
                
              </div>
            </div>
          </div >
        }
        primaryBtnDisable={!isMigrationChecked}
        messageSecondary={null} // You can set this to `null` or remove it entirely if unused
        primaryBtnAction={handleMigration}
        onClose={handleCloseMigration}
        primaryBtnText={t("Link this form that will keep the current flow and its history")}
        secondaryBtnText={t("Cancel")}
        secondayBtnAction={handleCloseMigration}
        buttonLoading={isMigrationLoading}
        size="sm"
      />}
      
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
          disableAllRevertButton={processData.status === "Published"}
        />
        {showTaskVarModal && (
          <TaskVariableModal
            showTaskVarModal={showTaskVarModal}
            onClose={CloseTaskVarModal}
            isPublished={isPublished}
            layoutNotsaved={layoutNotsaved}
            handleCurrentLayout={handleCurrentLayout}
          />
        )}
      </>
    );
  }
);

FlowEdit.propTypes = {
  CategoryType: PropTypes.shape({
    WORKFLOW: PropTypes.string.isRequired,
  }).isRequired,
  isPublished: PropTypes.bool.isRequired,
  setWorkflowIsChanged: PropTypes.func,
  migration: PropTypes.bool,
  setMigration: PropTypes.func,
  redirectUrl: PropTypes.string,
  isMigrated: PropTypes.bool,
  mapperId: PropTypes.string,
  layoutNotsaved: PropTypes.bool.isRequired,
  handleCurrentLayout: PropTypes.func,
  isMigrationLoading: PropTypes.bool,
  setIsMigrationLoading: PropTypes.func
};

export default FlowEdit;
