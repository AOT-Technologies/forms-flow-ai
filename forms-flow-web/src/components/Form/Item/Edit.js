import React, { useReducer, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card } from 'react-bootstrap';
import { Errors, FormBuilder, Formio } from "@aot-technologies/formio-react";
import { BackToPrevIcon } from "@formsflow/components";
import { CustomButton, ConfirmModal, HistoryModal } from "@formsflow/components";
import { RESOURCE_BUNDLES_DATA } from "../../../resourceBundles/i18n";
import LoadingOverlay from "react-loading-overlay-ts";
import _set from "lodash/set";
import _cloneDeep from "lodash/cloneDeep";
import _camelCase from "lodash/camelCase";
import { Translation, useTranslation } from "react-i18next";
import { push } from "connected-react-router";
import { HistoryIcon, PreviewIcon } from "@formsflow/components";
import ActionModal from "../../Modals/ActionModal.js";
import {
  setProcessDiagramXML,
  setProcessHistories
} from "../../../actions/processActions";
import {
  MULTITENANCY_ENABLED,
} from "../../../constants/constants";
//for save form
import { manipulatingFormData } from "../../../apiManager/services/formFormatterService";
import { formUpdate, getFormHistory } from "../../../apiManager/services/FormServices";
import { INACTIVE } from "../constants/formListConstants";
import utils from "@aot-technologies/formiojs/lib/utils";
import {
  setFormFailureErrorData,
  setFormSuccessData,
  setRestoreFormData,
  setRestoreFormId,
  setFormHistories
} from "../../../actions/formActions";
import {
  saveFormProcessMapperPost,
  saveFormProcessMapperPut,
  getProcessHistory
} from "../../../apiManager/services/processServices";

import _isEquial from "lodash/isEqual";
import { toast } from "react-toastify";
import BpmnEditor from '../../Modeler/Editors/BpmnEditor';
import { useParams } from "react-router-dom";
//getting process data
import { getFormProcesses } from "../../../apiManager/services/processServices";
//getting process diagram
import { getProcessXml } from "../../../apiManager/services/processServices";

import SettingsModal from "../../CustomComponents/settingsModal";
const reducer = (form, { type, value }) => {
  const formCopy = _cloneDeep(form);
  switch (type) {
    case "formChange":
      for (let prop in value) {
        if (Object.prototype.hasOwnProperty.call(value, prop)) {
          form[prop] = value[prop];
        }
      }
      return form;
    case "replaceForm":
      return _cloneDeep(value);
    case "title":
      if (type === "title" && !form._id) {
        formCopy.name = _camelCase(value);
        formCopy.path = _camelCase(value).toLowerCase();
      }
      break;
    default:
      break;
  }
  _set(formCopy, type, value);
  return formCopy;
};
const Edit = React.memo(() => {
  const dispatch = useDispatch();
  const workflow = useSelector((state) => state.process.workflowAssociated);
  const lang = useSelector((state) => state.user.lang);
  const { t } = useTranslation();
  const errors = useSelector((state) => state.form?.error);
  const processListData = useSelector((state) => state.process?.formProcessList);
  const processHistory = useSelector((state) => state.process?.processHistory);
  const formData = useSelector((state) => state.form?.form);
  const [form, dispatchFormAction] = useReducer(reducer, _cloneDeep(formData));
  const publisText = processListData.status == "active" ? "Unpublish" : "Publish";
  const [showFlow, setShowFlow] = useState(false);
  const [showLayout, setShowLayout] = useState(true);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const processXmlDiagram = useSelector((state) => state.process?.processXml);
  const { formId } = useParams();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const formAccess = useSelector((state) => state.user?.formAccess || []);
  const submissionAccess = useSelector((state) => state.user?.submissionAccess || []);
  const previousData = useSelector((state) => state.process?.formPreviousData);
  const formDescription = form?.description;
  const restoredFormData = useSelector((state) => state.formRestore?.restoredFormData);
  const restoredFormId = useSelector((state) => state.formRestore?.restoredFormId);
  const applicationCount = useSelector((state) => state.process?.applicationCount);
  const formHistory = useSelector((state) => state.formRestore?.formHistory || []);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [hasRendered, setHasRendered] = useState(false);
  const [isLoadingDiagram, setIsLoadingDiagram] = useState(true);
  const [showHistoryModal, setshowHistoryModal] = useState(false);
  //it returns the digram (old method);
  // const diagramXML = useSelector((state) => state.process.processDiagramXML);
  const roleIds = useSelector((state) => state.user?.roleIds || {});
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const handleOpenModal = () => setShowSettingsModal(true);
  const handleCloseModal = () => setShowSettingsModal(false);
  const pageNo = 1;
  const limit = 4;
  const [ history, setHistory] = useState(true);
  //action modal
  const [newActionModal, setNewActionModal] = useState(false);
  const onCloseActionModal = () => {
    setNewActionModal(false);
  };
  const CategoryType = {
    FORM: "FORM",
    WORKFLOW: "WORKFLOW"
  };

  useEffect(() => {
    if (showFlow) {
      setHasRendered(true);
    }
  }, [showFlow]);


  const handleShowLayout = () => {
    setShowFlow(false);
    setShowLayout(true);
  };
  const handleShowFlow = () => {
    setShowFlow(true);
    setShowLayout(false);
  };
useEffect(() => {
  if (formId) {
    // Fetch form processes with formId
    dispatch(getFormProcesses(formId));
  }
}, [formId]);

useEffect(() => {
  if (workflow?.value) {
    // Fetch workflow diagram XML when the workflow value is present
    dispatch(getProcessXml(workflow.value));
  }

  if (workflow?.value && processXmlDiagram) {
    // Set the process diagram XML and stop the loading spinner when both workflow and XML are available
    dispatch(setProcessDiagramXML(processXmlDiagram));
    setIsLoadingDiagram(false);
  }
}, [workflow?.value, processXmlDiagram]);



  //for save farm 
  const isMapperSaveNeeded = (newData) => {
    return (
      previousData.formName !== newData.title ||
      previousData.anonymous !== processListData.anonymous ||
      processListData.anonymous === null ||
      processListData.formType !== newData.type ||
      processListData.description !== formDescription
    );
  };

  const setFormProcessDataToVariable = (submittedData) => {
    const data = {
      anonymous:
        processListData.anonymous === null ? false : processListData.anonymous,
      formName: submittedData.title,
      parentFormId: processListData.parentFormId,
      formType: submittedData.type,
      status: processListData.status ? processListData.status : INACTIVE,
      taskVariables: processListData.taskVariables
        ? processListData.taskVariables
        : [],
      id: processListData.id,
      formId: submittedData._id,
      formTypeChanged: previousData.formType !== submittedData.type,
      titleChanged: previousData.formName !== submittedData.title,
      anonymousChanged: previousData.anonymous !== processListData.anonymous,
      description: formDescription
    };
    return data;
  };
  const isFormComponentsChanged = () => {
    if (restoredFormData && restoredFormId) {
      return true;
    }
    let flatFormData = utils.flattenComponents(formData.components);
    let flatForm = utils.flattenComponents(form.components);
    const dateTimeOfFormData = Object.values(flatFormData).filter(
      (component) => component.type == "day" || component.type == "datetime"
    );
    const dateTimeOfForm = Object.values(flatForm).filter(
      (component) => component.type == "day" || component.type == "datetime"
    );
    let comparisonBetweenDateTimeComponent = true;
    if (dateTimeOfFormData?.length === dateTimeOfForm.length) {
      dateTimeOfFormData.forEach((formDataComponent) => {
        if (comparisonBetweenDateTimeComponent) {
          const isEqual = dateTimeOfForm.some(
            (formComponent) => formComponent.type === formDataComponent.type
          );
          if (!isEqual) {
            comparisonBetweenDateTimeComponent = isEqual;
          }
        }
      });
    } else {
      return true;
    }
    // if existing all datetime components are same we need to remove those compoenent and need to check isEqual
    if (comparisonBetweenDateTimeComponent) {
      flatFormData = Object.values(flatFormData).filter(
        (component) => component.type !== "day" && component.type !== "datetime"
      );
      flatForm = Object.values(flatForm).filter(
        (component) => component.type !== "day" && component.type !== "datetime"
      );
    } else {
      return true;
    }

    return (
      !_isEquial(flatFormData, flatForm) ||
      formData.display !== form.display ||
      formData.type !== form.type
    );
  };

  const isNewMapperNeeded = () => {
    return previousData.formName !== form.title && applicationCount > 0;
  };
  const handleConfirmSettings = () => {
    const parentFormId = processListData.parentFormId;
      const mapper = {
      formId: form._id,
      formName: form.title,
      description: formDescription,
      status: processListData.status || "inactive",
      taskVariables: processListData.taskVariables
        ? processListData.taskVariables
        : [],
        anonymous: formAccess[0]?.roles.includes(roleIds.ANONYMOUS),
        parentFormId: parentFormId,
      formType: form.type,
      processKey: workflow?.value,
      processName: workflow?.name,
      id: processListData.id,
      workflowChanged: false,
      statusChanged: false,
      resourceId: form._id,
    };
    
    const authorizations = {
      application: {
        resourceId:parentFormId ,
        resourceDetails: {},
        roles: []
    },
      designer: {
        resourceId: parentFormId,
        resourceDetails: {},
        roles: []
    },
    form: {
      resourceId: parentFormId,
      resourceDetails: {},
      roles: []
  }
};
    dispatch(saveFormProcessMapperPut({mapper, authorizations}));
    };
  

  const closeSaveModal = () => {
    setShowSaveModal(false);
  };

  const saveFormData = () => {
    setShowSaveModal(false);
    setFormSubmitted(true);
    const newFormData = manipulatingFormData(
      form,
      MULTITENANCY_ENABLED,
      tenantKey,
      formAccess,
      submissionAccess
    );
    newFormData.componentChanged = isFormComponentsChanged();
    newFormData.parentFormId = previousData.parentFormId;

    formUpdate(newFormData._id, newFormData)
      .then((res) => {
        const { data: submittedData } = res;
        if (isMapperSaveNeeded(submittedData)) {
          const data = setFormProcessDataToVariable(submittedData);

          // PUT request : when application count is zero.
          // POST request with updated version : when application count is positive.

          if (isNewMapperNeeded()) {
            data["version"] = String(+previousData.version + 1);
            data["processKey"] = previousData.processKey;
            data["processName"] = previousData.processName;
            data.parentFormId = processListData.parentFormId;
            dispatch(saveFormProcessMapperPost(data));
          } else {
            // For hadling uploaded forms case.

            if (processListData && processListData.id) {
              // For created forms we would be having a mapper

              dispatch(saveFormProcessMapperPut(data));
            } else {
              // For uploaded forms we have to create new mapper.

              dispatch(saveFormProcessMapperPost(data));
            }
          }
        }
        dispatch(setRestoreFormData({}));
        dispatch(setRestoreFormId(null));
        toast.success(t("Form saved"));
        dispatch(setFormSuccessData("form", submittedData));
        Formio.cache = {};
      })
      .catch((err) => {
        const error = err.response?.data || err.message;
        dispatch(setFormFailureErrorData("form", error));
      })
      .finally(() => {
        setFormSubmitted(false);
      });
  };

  const backToForm = () => {
    dispatch(push(`${redirectUrl}form/`));
    console.log("back", redirectUrl);
  };

  const closeHistoryModal = () => {
    setshowHistoryModal(false);
  };

  const fetchFormHistory = (parentFormId, page, limit) => {
    getFormHistory(parentFormId, page, limit)
      .then((res) => {
        dispatch(setFormHistories(res.data.formHistory));
      })
      .catch(() => {
        setFormHistories([]);
      });
  };

  const fetchProcessHistory = (processKey, page, limit) => {
    getProcessHistory(processKey, page, limit)
      .then((res) => {
        dispatch(setProcessHistories(res.data.processHistory));
      })
      .catch(() => {
        setProcessHistories([]);
      });
  };

  useEffect(() => {
    if (processListData?.parentFormId && !formHistory.length) {
      fetchFormHistory(processListData?.parentFormId, pageNo, limit);
    }
    if (processListData?.processKey && !processHistory.length) {
      fetchProcessHistory(processListData?.processKey, pageNo, limit);
    }
  }, [processListData]);

  const handleHistory = (type) => {
    setshowHistoryModal(true);
    if (type === 'WORKFLOW') {
      setHistory(false);
    }
    else {
      setHistory(true);
    }
  };

  const loadMoreBtnAction = () => {
    history 
      ? fetchFormHistory(processListData?.parentFormId)
      : fetchProcessHistory(processListData?.processKey);
  };

  const revertBtnAction = (cloneId) => {
    dispatch(setRestoreFormId(cloneId));
  };

  const handlePreviewAndVariables = () => {
    console.log("handlePreviewAndVariables");
  };

  const handlePreview = () => {
    console.log("handlePreview");
  };

  const saveFlow = () => {
    console.log("saveFlow");
  };

  const saveLayout = () => {
    setShowSaveModal(true);
  };

  const discardChanges = () => {
    console.log("discardChanges");
  };

  // const editorSettings = () => {
  //   console.log("ecitorActions");
  // };
  const editorActions = () => {
    setNewActionModal(true);
  };

  const handlePublish = () => {
    console.log("publish");
  };



  const formChange = (newForm) =>
    dispatchFormAction({ type: "formChange", value: newForm });
  return (
    <div>
      <div>
        <LoadingOverlay
          active={formSubmitted}
          spinner
          text={t("Loading...")}
        >

<SettingsModal show={showSettingsModal} handleClose={handleCloseModal} 
handleConfirm={handleConfirmSettings} />

          <Errors errors={errors} />

          <Card className="editor-header">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center justify-content-between">
                  <BackToPrevIcon onClick={backToForm} />
                  <div className="mx-4 editor-header-text">{form.title}</div>
                  <span data-testid={`form-status-${form._id}`} className="d-flex align-items-center white-text mx-3">
                    {processListData.status == "active" ? (
                      <>
                        <div className="status-live"></div>
                      </>
                    ) : (
                      <div className="status-draft"></div>
                    )}
                    {processListData.status == "active" ? t("Live") : t("Draft")}
                  </span>
                </div>
                <div>
                  <CustomButton
                    variant="dark"
                    size="md"
                    label={<Translation>{(t) => t("Settings")}</Translation>}
                    onClick={handleOpenModal}
                    dataTestid="eidtor-settings-testid"
                    ariaLabel={t("Designer Settings Button")}
                  />
                  <CustomButton
                    variant="dark"
                    size="md"
                    className="mx-2"
                    label={t("Actions")}
                    onClick={editorActions}
                    dataTestid="designer-action-testid"
                    ariaLabel={(t) => t("Designer Actions Button")}
                  />
                  <CustomButton
                    variant="light"
                    size="md"
                    label={t(publisText)}
                    onClick={handlePublish}
                    dataTestid="handle-publish-testid"
                    ariaLabel={`${t(publisText)} ${t("Button")}`}
                  />
                </div>
              </div>
            </Card.Body>
          </Card>
          <div className="d-flex mb-3">
            <div className={`wraper form-wraper ${showLayout ? 'visible' : ''}`}>
              <Card>
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center" style={{ width: "100%" }}>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="mx-2 builder-header-text">Layout</div>
                      <div>
                        <CustomButton
                          variant="secondary"
                          size="md"
                          icon={<HistoryIcon />}
                          label={t("History")}
                          onClick={() => handleHistory(CategoryType.FORM)}
                          dataTestid="handle-form-history-testid"
                          ariaLabel={t("Form History Button")}
                        />
                        <CustomButton
                          variant="secondary"
                          size="md"
                          className="mx-2"
                          icon={<PreviewIcon />}
                          label={t("Preview")}
                          onClick={handlePreview}
                          dataTestid="handle-preview-testid"
                          ariaLabel={t("Preview Button")}
                        />
                      </div>
                    </div>
                    <div>
                      <CustomButton
                        variant="primary"
                        size="md"
                        className="mx-2"
                        label={<Translation>{(t) => t("Save Layout")}</Translation>}
                        onClick={saveLayout}
                        dataTestid="save-form-layout"
                        ariaLabel={t("Save Form Layout")}
                      />
                      <CustomButton
                        variant="secondary"
                        size="md"
                        label={<Translation>{(t) => t("Discard Changes")}</Translation>}
                        onClick={discardChanges}
                        dataTestid="discard-button-testid"
                        ariaLabel={t("cancelBtnariaLabel")}
                      />
                    </div>
                  </div>

                </Card.Header>
                <Card.Body>
                  <div className="form-builder">
                    <FormBuilder
                      key={form._id}
                      form={form}
                      onChange={formChange}
                      options={{
                        language: lang,
                        i18n: RESOURCE_BUNDLES_DATA,
                      }}
                    />
                  </div>
                </Card.Body>
              </Card>
            </div>
            <div className={`wraper flow-wraper ${showFlow ? 'visible' : ''}`}>
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
                          label={<Translation>{(t) => t("History")}</Translation>}
                          onClick={() => handleHistory(CategoryType.WORKFLOW)}
                          dataTestid="flow-history-button-testid"
                          ariaLabel={t("Flow History Button")}
                        />
                        <CustomButton
                          variant="secondary"
                          size="md"
                          className="mx-2"
                          label={<Translation>{(t) => t("Preview & Variables")}</Translation>}
                          onClick={handlePreviewAndVariables}
                          dataTestid="preview-and-variables-testid"
                          ariaLabel={t("{Preview and Variables Button}")}
                        />
                        {/* <CustomButton
                          variant="secondary"
                          size="md"
                          className="mx-2"
                          label={<Translation>{(t) => t("Switch to BPMN")}</Translation>}
                          onClick={setWorkflowType}
                          dataTestid={"cancelBtndataTestid"}
                          ariaLabel={"cancelBtnariaLabel"}
                        /> */}
                      </div>
                    </div>
                    <div>
                      <CustomButton
                        variant="primary"
                        size="md"
                        className="mx-2"
                        label={<Translation>{(t) => t("Save Flow")}</Translation>}
                        onClick={saveFlow}
                        dataTestid="save-flow-layout"
                        ariaLabel={t("Save Flow Layout")}
                      />
                      <CustomButton
                        variant="secondary"
                        size="md"
                        label={<Translation>{(t) => t("Discard Changes")}</Translation>}
                        onClick={discardChanges}
                        dataTestid="discard-flow-changes-testid"
                        ariaLabel={t("Discard Flow Changes")}
                      />
                    </div>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="flow-builder">
                    {isLoadingDiagram ? (
                      "loading..." // TBD: add a loader here
                    ) : (
                      <BpmnEditor
                        processKey={workflow?.value}
                        tenant={workflow?.tenant}
                        isNewDiagram={false}
                        bpmnXml={processXmlDiagram}
                      />
                    )
                    }
                  </div>
                </Card.Body>
              </Card>
            </div>
            {showFlow && <div className={`form-flow-wraper-left ${showFlow ? 'visible' : ''}`} onClick={handleShowLayout}>Layout</div>}
            {showLayout && <div className={`form-flow-wraper-right ${showLayout && hasRendered ? 'visible' : ''}`}
              onClick={handleShowFlow}>Flow</div>}

            {/* {showLayout && <div className={`form-flow-wraper-right ${showLayout ? 'visible' : ''}`} onClick={handleShowFlow}>Flow</div>} */}
          </div>

        </LoadingOverlay>
      </div>
      <ActionModal
        newActionModal={newActionModal}
        onClose={onCloseActionModal}
        CategoryType={CategoryType.FORM}
      />

      <ConfirmModal
        show={showSaveModal}
        title={<Translation>{(t) => t("Save Your Changes")}</Translation>}
        message={<Translation>{(t) => t("Saving as an incrimental version will affect previous submissions. Saving as a new full version will not affect previous submissions.")}</Translation>}
        primaryBtnAction={saveFormData}
        onClose={closeSaveModal}
        secondayBtnAction={"add secondary button action"}
        primaryBtnText={<Translation>{(t) => t("Save as Version 3.5")}</Translation>}
        secondaryBtnText={<Translation>{(t) => t("Save as Version 4.0")}</Translation>}
        size="md"
      />
       <HistoryModal
        show={showHistoryModal}
        onClose={closeHistoryModal}
        title={<Translation>{(t) => t("History")}</Translation>}
        loadMoreBtnText={<Translation>{(t) => t("Load More")}</Translation>}
        revertBtnText={<Translation>{(t) => t("Revert To This")}</Translation>}
        formHistory={history ? formHistory : processHistory} 
        loadMoreBtnAction={loadMoreBtnAction}
        categoryType={history ? CategoryType.FORM : CategoryType.WORKFLOW}
        revertBtnAction={revertBtnAction}
       />
      <div>
      </div>
      
    </div >
  );
});

export default Edit;