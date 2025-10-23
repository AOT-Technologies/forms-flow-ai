import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect
} from "react";
import {
  CustomButton,
  PromptModal,
  // HistoryModal,
  //CurlyBracketsIcon,
  VariableSelection,
  CloseIcon,
  CustomInfo,
  Switch
} from "@formsflow/components";
// import { Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "react-query";
import { setProcessData } from "../../../actions/processActions.js";
import BpmnEditor from "../../../components/Modeler/Editors/BpmnEditor/BpmEditor";
import LoadingOverlay from "react-loading-overlay-ts";
import { push } from "connected-react-router";
import { processMigrate } from "../../../apiManager/services/FormServices";
import {
  updateProcess,
  fetchRevertingProcessData,
  saveFormProcessMapperPut
} from "../../../apiManager/services/processServices.js";
import { toast } from "react-toastify";
import {
  createXMLFromModeler,
  compareXML,
  validateProcess,
} from "../../../helper/processHelper.js";
import PropTypes from "prop-types";
import userRoles from "../../../constants/permissions.js";
import BPMNViewer from "../../../components/BPMN/BpmnViewer.js";
import Modal from "react-bootstrap/Modal";  
import { SystemVariables } from '../../../constants/variables';
import { createDefaultBpmnXml } from "../../../constants/defaultBpmnTemplate.js";

const FlowEdit = forwardRef(
  (
    {
      isPublished = false,
      setWorkflowIsChanged,
      migration,
      setMigration,
      redirectUrl,
      isMigrated = true,
      mapperId,
      layoutNotsaved,
      handleCurrentLayout,
      isMigrationLoading,
      setIsMigrationLoading,
      isCreateRoute = false,
      currentBpmnXml = null,  
      setCurrentBpmnXml = () => {},
      // handleUnpublishAndSaveChanges,
    },
    ref
  ) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const bpmnRef = useRef();
    const processData = useSelector((state) => state.process?.processData);
    const [lintErrors, setLintErrors] = useState([]);
    
    // Initialize default BPMN for create route
    const [defaultBpmnXml] = useState(() => {
      if (isCreateRoute) {
        return createDefaultBpmnXml();
      }
      return null;
    });
    const [showDiscardModal, setShowDiscardModal] = useState(false);
    const [isReverted, setIsReverted] = useState(false);
    const { createDesigns } = userRoles();
    const [showVariableModal, setShowVariableModal] = useState(false);
    const [showUnsavedChangesModal, setShowUnsavedChangesModal] =
      useState(false);
    const [isMigrationChecked, setIsMigrationChecked] = useState(false);
    const [showMigrationModal, setShowMigrationModal] = useState(false);

    /* ------------ data that need to pass to reusabel variable modal ----------- */
    const form = useSelector((state) => state.form?.form || {});
    const [savedFormVariables, setSavedFormVariables] = useState({});
    const formProcessList = useSelector(
      (state) => state.process.formProcessList
    );
    useEffect(() => {
      const updatedLabels = {};
      // Add taskVariables to updatedLabels
      formProcessList?.taskVariables?.forEach(({ key, label, type }) => {
        updatedLabels[key] = {
          key,
          altVariable: label, // Use label from taskVariables as altVariable
          labelOfComponent: label, // Set the same label for labelOfComponent
          type: type,
        };
      });
      setSavedFormVariables(updatedLabels);
    }, [formProcessList]);
    /* --------- fetching all process history when click history button --------- */
    // const {
    //   // data: { data: historiesData } = {}, // response data destructured
    //   mutate: fetchHistories, // mutate function used to call the api function and here mutate renamed to fetch histories
    //   // isLoading: historiesLoading,
    //   // isError: historiesError,
    // } = useMutation(
    //   ({ parentProcessKey, page, limit }) =>
    //     getProcessHistory({ parentProcessKey, page, limit }) // this is api calling function and mutate function accepting some parameter and passing to the apicalling function
    // );

    /* --------- fetch a perticular history when click the revert button -------- */
    const {
      data: { data: historyData } = {},
      isLoading: historyLoading,
      // isError: historyDataError,
    } = useMutation((processId) => fetchRevertingProcessData(processId), {
      onSuccess: () => {
        setIsReverted(true);
        enableWorkflowChange();
      },
    });

    const handleDiscardModal = () => setShowDiscardModal(!showDiscardModal);


const enableWorkflowChange = async () => {  
  setWorkflowIsChanged(true); // this function passed from parent
  try {
    const bpmnModeler = bpmnRef.current?.getBpmnModeler();
    if (bpmnModeler) {
      const { xml } = await bpmnModeler.saveXML({ format: true });
      setCurrentBpmnXml(xml);
    }
  } catch (error) {
    console.error('Error updating current BPMN XML:', error);
  }
};

    const disableWorkflowChange = () => {
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
        processKey: processData.processKey,
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
        // On create route, revert to default XML; on edit route, revert to original processData
        const xmlToRevert = isCreateRoute 
          ? defaultBpmnXml 
          : processData?.processData;
        
        //import the existing process data to bpmn
        bpmnRef.current?.handleImport(xmlToRevert);
        isReverted && setIsReverted(!isReverted); //once it reverted then need to make it false
        disableWorkflowChange();
        handleDiscardModal();
      }
    };

    // const handleProcessHistory = () => {
    //   handleToggleHistoryModal();
    //   fetchHistories({
    //     parentProcessKey: processData.parentProcessKey, // passing process key to get histories data
    //     page: 1,
    //     limit: 4,
    //   });
    // };

    // const loadMoreBtnAction = () => {
    //   fetchHistories({ parentProcessKey: processData.parentProcessKey });
    // };
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

    const saveFlow = async ({ processId = null, showToast = true } = {}) => {
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

        const response = await updateProcess({
          type: "BPMN",
          id: processId || processData.id,
          data: xml,
        });
        dispatch(setProcessData(response.data));
        disableWorkflowChange();
        isReverted && setIsReverted(!isReverted); //if it already reverted the need to make it false
        showToast && toast.success(t("Process updated successfully"));
      } catch (error) {
        toast.error(t("Failed to update process"));
      }
    };

    useImperativeHandle(ref, () => ({
      saveFlow,
      handleSaveFlowClick, // expose for parent (FormEdit) to trigger Save Flow
      handleImport: (xml) => {
        bpmnRef.current?.handleImport(xml);
      },
      getBpmnModeler: () => {
        return bpmnRef.current?.getBpmnModeler();
      },
      getDefaultXml: () => {
        return defaultBpmnXml;
      },
    }));

    //   const handlePreviewAndVariables = () => {
    //   if (layoutNotsaved) {
    //     setShowUnsavedChangesModal(true);
    //   } else {
    //     setShowVariableModal(true);
    //   }
    // };

    const handleCloseVariableModal = () => {
      setShowVariableModal(false);
    };
    const handleCloseMigration = () => {
      setShowMigrationModal(false);
    };

    const handleSaveVariables = async (variables) => {
      if (!variables) return;
      const currentTaskVariables = Object.values(variables).map((i) => ({
        key: i.key,
        label: i.altVariable || i.labelOfComponent, // If altVariable exists, use it, otherwise it will be  labelOfComponent
        type: i.type,
      }));
      const mapper = {
        formId: formProcessList.formId,
        id: formProcessList.id,
        parentFormId: formProcessList.parentFormId,
        taskVariables: currentTaskVariables,
        formName: formProcessList.formName,
      };
      await dispatch(saveFormProcessMapperPut({ mapper }));
    };

    const handleCloseUnsavedChangesModal = () => {
      setShowUnsavedChangesModal(false);
    };

    const handleBackToLayout = () => {
      handleCloseUnsavedChangesModal();
      handleCurrentLayout();
  };
  
  const getSystemVariables = () => {
    return SystemVariables.map((variable, idx) => ({
      id: idx + 1,
      type: variable.labelOfComponent,
      variable: variable.key,
      altVariable: variable.altVariable,
      selected: (
        <Switch
          type="primary"
          withIcon={true}
          checked={true}
          onChange={() => {}}
          ariaLabel="System variable always selected"
          dataTestId={`system-variable-switch-${variable.key || idx}`}
          disabled
        />
      ),
    }));
  };

  const columns = [
    { field: 'type', headerName: 'Type', flex: 1.5, sortable: false },
    { field: 'variable', headerName: 'Variable', width: 130, sortable: false },
    { field: 'altVariable', headerName: 'Alternative Field', width: 130, sortable: false },
    {
      field: "selected",
      headerName: "Selected",
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <Switch
          type="primary"
          withIcon={true}
          checked={true}
          onChange={() => { console.log(params.row.id); }}
          aria-label="System variable always selected"
          datatestid={`system-variable-switch-${params.row.variable}`}
        />
      ),
    },
  ];

    return (
      <>
        {/* <Card> */}
        <div>
          <PromptModal
            show={showDiscardModal}
            title={t(`Discard Flow Changes?`)}
            message={t(
              "Are you sure you want to discard all unsaved changes to the flow of the form?"
            )}
            primaryBtnAction={handleDiscardConfirm}
            onClose={handleDiscardModal}
            primaryBtnText={t("Yes, Discard All Unsaved Changes")}
            secondaryBtnText={t("No, Keep The Changes")}
            secondaryBtnAction={handleDiscardModal}
            type="warning"
            size="md"
            primaryBtndataTestid="discard-confirm-button"
            secondoryBtndataTestid="discard-cancel-button"
            primaryBtnariaLabel={t("Yes, Discard All Unsaved Changes")}
            secondoryBtnariaLabel={t("No, Keep The Changes")}
          />
          {/* <div className="head">
            {createDesigns && (
              <div>
                <CustomButton
                  label={t("Save Flow")}
                  onClick={isPublished ? handleUnpublishAndSaveChanges : handleSaveFlowClick}
                  disabled={!workflowIsChanged}
                  dataTestId="save-flow-layout"
                  ariaLabel={t("Save Flow Layout")}
                  buttonLoading={savingFlow}
                />
                <CustomButton
                  label={t("Discard Changes")}
                  onClick={handleDiscardModal}
                  disabled={!workflowIsChanged}
                  dataTestId="discard-flow-changes-testid"
                  ariaLabel={t("Discard Flow Changes")}
                  secondary
                />
              </div>
            )}
          </div> */}
          <div className="body">
            {/* <Card.Body> */}
            <LoadingOverlay
              active={historyLoading}
              spinner
              text={t("Loading...")}
            >
              <div className="flow-builder">
                {!createDesigns ? (
                  <BPMNViewer bpmnXml={processData?.processData || defaultBpmnXml} />
                ) : (
                  <BpmnEditor
                    onChange={enableWorkflowChange} //handled is workflow changed or not
                    ref={bpmnRef}
                    setLintErrors={setLintErrors}
                    bpmnXml={
                      isReverted
                        ? historyData?.processData
                        : (currentBpmnXml || processData?.processData || defaultBpmnXml)
                    }
                  />
                )}
              </div>
            </LoadingOverlay>
            {/* </Card.Body> */}
          </div>
          {/* </Card> */}
        </div>
        {showMigrationModal && (
          <PromptModal
            show={showMigrationModal}
            title={t("***Migration Notice***")}
            size="lg"
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
                flow and its history.`)}{" "}
                  </label>
                  <div className="dashed-line"></div>
                  <div className="custom-checkbox d-flex justify-content-between align-items-center gap-2">
                    <input
                      type="checkbox"
                      className="form-check-input mb-2"
                      onChange={() => setIsMigrationChecked((prev) => !prev)}
                      data-testid="migration-confirm"
                      checked={isMigrationChecked}
                    />
                    <label className="message-primary">{t(`I confirm`)}</label>
                  </div>
                </div>
              </div>
            }
            primaryBtnDisable={!isMigrationChecked}
            primaryBtnAction={handleMigration}
            onClose={handleCloseMigration}
            primaryBtnText={t(
              "Link this form that will keep the current flow and its history"
            )}
            secondaryBtnText={t("Cancel")}
            secondaryBtnAction={handleCloseMigration}
            buttonLoading={isMigrationLoading}
            type="info"
            primaryBtndataTestid="migration-confirm-button"
            secondoryBtndataTestid="migration-cancel-button"
            primaryBtnariaLabel={t(
              "Link this form that will keep the current flow and its history"
            )}
            secondoryBtnariaLabel={t("Cancel")}
          />
        )}

        {/* <HistoryPage
          show={showHistoryModal}
          onClose={handleToggleHistoryModal}
          title={t("History")}
          loadMoreBtnText={t("Load More")}
          loadMoreBtndataTestId="load-more-flow-history"
          revertBtnText={t("Revert To This")}
          allHistory={historiesData?.processHistory || []}
          loadMoreBtnAction={loadMoreBtnAction}
          categoryType={CategoryType.WORKFLOW}
          revertBtnAction={fetchHistoryData}
          historyCount={historiesData?.totalCount || 0}
          disableAllRevertButton={
            processData.status === "Published" || isPublished
          }
        /> */}
        {/* Show unsaved changes modal when layout is not saved */}
        {showUnsavedChangesModal && (
          <Modal
            show={showUnsavedChangesModal}
            size="sm"
            data-testid="unsaved-changes-modal"
          >
            <Modal.Header>
              <Modal.Title>
                {t("Selecting Variables Is Not Available")}
              </Modal.Title>
              <div
                className="icon-close"
                onClick={handleCloseUnsavedChangesModal}
              >
                <CloseIcon dataTestId="close-task-var-modal" />
              </div>
            </Modal.Header>
            <Modal.Body>
              <CustomInfo
                heading={t("Note")}
                content={t(
                  "Variables can be accessed only when there are no pending changes to the layout. Please go back to the layout section and save or discard your changes."
                )}
              />
            </Modal.Body>
            <Modal.Footer>
              <div className="buttons-row">
                <CustomButton
                  label={t("Back to Layout")}
                  ariaLabel="Back to Layout btn"
                  dataTestId="back-to-layout-btn"
                  onClick={handleBackToLayout}
                />
                <CustomButton
                  label={t("Cancel")}
                  ariaLabel="Cancel btn"
                  dataTestId="cancel-btn"
                  onClick={handleCloseUnsavedChangesModal}
                  secondary
                />
              </div>
          </Modal.Footer>
        </Modal>
      )}
      {/* Show variable modal when layout is saved */}
      {!layoutNotsaved && showVariableModal && (
        <VariableSelection
          form={form}
          show={showVariableModal}
          onClose={handleCloseVariableModal}
          saveBtnDisabled={isPublished || !createDesigns}
          savedFormVariables={savedFormVariables}
          primaryBtnAction={handleSaveVariables}
          rowVariables={getSystemVariables()}
          columns={columns}
        />
      )}
    </>
  );
  }
);

FlowEdit.propTypes = {
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
  setIsMigrationLoading: PropTypes.func,
  isCreateRoute: PropTypes.bool,
  currentBpmnXml: PropTypes.string,
  setCurrentBpmnXml: PropTypes.func,
};

export default FlowEdit;