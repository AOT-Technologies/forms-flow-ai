import React, { useReducer, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card } from 'react-bootstrap';
import { Errors, FormBuilder, Formio } from "react-formio";
import { BackToPrevIcon } from "@formsflow/components";
import ProcessDiagram from "../../BPMN/ProcessDiagramHook";
import { CustomButton, ConfirmModal } from "@formsflow/components";
import { RESOURCE_BUNDLES_DATA } from "../../../resourceBundles/i18n";
import LoadingOverlay from "react-loading-overlay-ts";
import _set from "lodash/set";
import _cloneDeep from "lodash/cloneDeep";
import _camelCase from "lodash/camelCase";
import { Translation, useTranslation } from "react-i18next";
import { listProcess } from "../../../apiManager/services/formatterService";
import { push } from "connected-react-router";
import { HistoryIcon, PreviewIcon } from "@formsflow/components";
import {
  MULTITENANCY_ENABLED,
} from "../../../constants/constants";
//for save form
import { manipulatingFormData } from "../../../apiManager/services/formFormatterService";
import { formUpdate } from "../../../apiManager/services/FormServices";
import { INACTIVE } from "../constants/formListConstants";
import utils from "formiojs/utils";
import {
  setFormFailureErrorData,
  setFormSuccessData,
  setRestoreFormData,
  setRestoreFormId,
} from "../../../actions/formActions";
import {
  saveFormProcessMapperPost,
  saveFormProcessMapperPut,
} from "../../../apiManager/services/processServices";

import _isEquial from "lodash/isEqual";
import { toast } from "react-toastify";


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
  const process = useSelector((state) => state.process.processList);
  const processList = listProcess(process);
  const workflow = useSelector((state) => state.process.workflowAssociated);
  const lang = useSelector((state) => state.user.lang);
  const { t } = useTranslation();
  const errors = useSelector((state) => state.form?.error);
  const processListData = useSelector((state) => state.process?.formProcessList);
  const formData = useSelector((state) => state.form?.form);
  const [form, dispatchFormAction] = useReducer(reducer, _cloneDeep(formData));
  const publisText = processListData.status == "active" ? "Unpublish" : "Publish";
  const [showFlow, setShowFlow] = useState(false);
  const [showLayout, setShowLayout] = useState(true);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";

  //for save form 
  const [formSubmitted, setFormSubmitted] = useState(false);
  const formAccess = useSelector((state) => state.user?.formAccess || []);
  const submissionAccess = useSelector((state) => state.user?.submissionAccess || []);
  const previousData = useSelector((state) => state.process?.formPreviousData);
  const formDescription = form?.description;
  const restoredFormData = useSelector((state) => state.formRestore?.restoredFormData);
  const restoredFormId = useSelector((state) => state.formRestore?.restoredFormId);
  const applicationCount = useSelector((state) => state.process?.applicationCount);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [hasRendered, setHasRendered] = useState(false);

  useEffect(() => {    
    if(showFlow) { 
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

  //for save farm 
  const isMapperSaveNeeded = (newData) => {
    // checks if the updates need to save to form_process_mapper too
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
      taskVariable: processListData.taskVariable
        ? processListData.taskVariable
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

  const handleHistory = () => {
    console.log("handleHistory");
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

  const editorSettings = () => {
    console.log("ecitorActions");
  };
  const editorActions = () => {
    console.log("ecitorActions");
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
                    onClick={editorSettings}
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
                          onClick={handleHistory}
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
                          onClick={handleHistory}
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
                    {processList.length && workflow?.value ? (
                      <div className="my-4">
                        <ProcessDiagram
                          processKey={workflow?.value}
                          tenant={workflow?.tenant}
                        />
                      </div>) : ""}
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
    </div >
  );
});

export default Edit;