import React, { useEffect, useRef, useState, useCallback } from "react";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
  CloseIcon,
  CustomInfo,
  CustomButton,
  CustomPill,
  FormInput,
} from "@formsflow/components";
import { Form, Utils } from "@aot-technologies/formio-react";
import PropTypes from "prop-types";
import { useDispatch ,useSelector } from "react-redux";
import {
  saveFormProcessMapperPut,
} from "../../apiManager/services/processServices";
import _ from "lodash";
import { StyleServices } from "@formsflow/service";


  // Filter out applicationId and applicationStatus
  const ignoreKeywords = new Set([
    "applicationId",
    "applicationStatus",
    "currentUser",
    "submitterEmail",
    "submitterFirstName",
    "submitterLastName",
    "currentUserRole",
    "allAvailableRoles"
  ]);

//TBD in case of Bundle form display
const PillList = React.memo(({ alternativeLabels, onRemove }) => {
  const { t } = useTranslation();
  const primaryColor = StyleServices.getCSSVariable('--ff-primary'); 
  const primaryLight = StyleServices.getCSSVariable('--ff-primary-light'); 

  const filteredVariablePills = Object.values(alternativeLabels).filter(
    ({ key }) => !ignoreKeywords.has(key)
  );
  return (
    <div className="pill-container">
      {filteredVariablePills.length ? (
        filteredVariablePills.map(
          ({key, altVariable, labelOfComponent }) => (
            <CustomPill
              key={key}
              label={altVariable || labelOfComponent}
              icon={<CloseIcon color={primaryColor} data-testid="pill-remove-icon" />}
              bg={primaryLight}
              onClick={() => onRemove(key)}
              secondaryLabel={key}
            />
          )
        )
      ) : (
        <p className="select-text">{t("Pick variables below")}</p>
      )}
    </div>
  );
});
// PropTypes for PillList
PillList.propTypes = {
  alternativeLabels: PropTypes.object.isRequired,
  onRemove: PropTypes.func.isRequired,
};
/* ------------------------------ end pill list ----------------------------- */

const FormComponent = React.memo(
  ({ form,
    alternativeLabels,
    setAlternativeLabels,
    selectedComponent,
    setSelectedComponent
 }) => {
    const [showElement, setShowElement] = useState(false);
    const formRef = useRef(null);
    const detailsRef = useRef(null); // Ref for the details container
    const { t } = useTranslation();

    /* ------------- manipulate the hidden variable to show in form ------------- */
    const [updatedForm, setUpdatedForm] = useState(null);
    const [manipulatedKeys, setManipulatedKeys] = useState(new Set());
    const [nestedDataKeys, setNestedDataKeys] = useState({});

    function getParentKeys(parentComponent) {
      if (!parentComponent) return [];
  
      const parentElement = parentComponent.getAttribute("ref");
  
      if (parentElement === "webform") return [];
  
      const nestedContainer = parentElement?.slice(7);
  
      if (parentElement === "component") {
          return getParentKeys(parentComponent.parentElement);
      }
  
      return nestedDataKeys[nestedContainer]
          ? [...getParentKeys(parentComponent.parentElement),nestedContainer]
          : getParentKeys(parentComponent.parentElement);
  }
  

    useEffect(()=>{
      const data = _.cloneDeep(form);
      const manipulatedKeys = [];
      Utils.eachComponent(data.components,(component)=>{
        // remove display (show/hide) conditions for showing the component in taskvariable modal
        /* --------------------------- ------------------ --------------------------- */
        component.conditional = {};
        component.customConditional = "";
        component.logic = [];
        component.hidden = false;
        component.hideLabel = false;
        if(component.type == "container" || component.type == "survey" ){
          setNestedDataKeys(prev=>({...prev, [component.key]:component.type}));
        }
        /* ---------------------------------- ---- ---------------------------------- */
        //Keys ignored for the default task variable that don't need to be displayed in the form.
        if(component.type == "hidden" && !ignoreKeywords.has(component.key)){
          component.type = "textfield";
          manipulatedKeys.push(component.key);
          component.customClass = "taskvariable-hiddent-component";
        }
      },true);
      setUpdatedForm(data);
      setManipulatedKeys(new Set(manipulatedKeys));
    },[]);

    const ignoredTypes = new Set([
      "button",
      "columns",
      "panel",
      "well",
      "container",
      "htmlelement",
      "tabs",
    ]);
    const ignoredKeys = new Set([
      "hidden",
    ]);
    const handleClick = useCallback(
      (e) => {
        const formioComponent = e.target.closest(".formio-component");
        const highlightedElement = document.querySelector(".formio-hilighted");

        if (highlightedElement) {
          highlightedElement.classList.remove("formio-hilighted");
        }
        const parentComponent = formioComponent.parentElement;
        const parentKeys = getParentKeys(parentComponent);
        
       
        if (formioComponent) { 
          let classes = Array.from(formioComponent.classList).filter((cls) =>
            cls.startsWith("formio-component-")
          );
          const keyClass = classes[classes.length - 1];
          const typeClass = classes[classes.length - 2];
          //if key and type are same , then there will be only one class for both
          const componentType = typeClass ? typeClass.split("-").pop() : keyClass.split("-").pop();
          const componentKey = keyClass?.split("-").pop();
          // Check if the component type is in the ignored list
          // Check if the component key is in the ignored list

          if (ignoredTypes.has(componentType) || ignoredKeys.has(componentKey)) {
            setShowElement(false);
            setSelectedComponent({
              key: null,
              type: "",
              label: "",
              altVariable: "",
            });
            return;
          }


          const labelElement = formioComponent.querySelector("label");
          let label = "";

          if (labelElement) {
            label = Array.from(labelElement.childNodes)
              .filter(
                (node) =>
                  !(
                    node.nodeType === Node.ELEMENT_NODE &&
                    node.classList.contains("sr-only")
                  )
              )
              .map((node) => node.textContent.trim())
              .join(" ");
          }

          // Highlight the selected component
          formioComponent.classList.add("formio-hilighted");
          setShowElement(true);

          // Update the selected component state
          setSelectedComponent({
            key: parentKeys.length ? [...parentKeys, componentKey].join(".") : componentKey,
            type: manipulatedKeys.has(componentKey) ? "hidden" : componentType,
            label,
            altVariable: alternativeLabels[componentKey]?.altVariable || "",
          });
        } else {
          setSelectedComponent({
            key: null,
            type: "",
            label: "",
            altVariable: "",
          });
        }
      },
      [alternativeLabels, manipulatedKeys]
    );
    // hide details when clicking outside form component and removinf the formio-highlighted class
    useEffect(() => {
      const formHilighter = document.querySelector(".form-hilighter");

      const handleOutsideClick = (event) => {
        const clickedInsideForm = formHilighter?.contains(event.target);
        const clickedInsideDetails = detailsRef.current?.contains(event.target);

        if (!clickedInsideForm && !clickedInsideDetails) {
          setShowElement(false);
          const highlightedElement = document.querySelector(".formio-hilighted");
          if (highlightedElement) {
            highlightedElement.classList.remove("formio-hilighted"); // Remove the highlight class
          }
        }
      };
      formHilighter?.addEventListener("click", handleClick);
      document.addEventListener("mousedown", handleOutsideClick);

      return () => {
        formHilighter?.removeEventListener("click", handleClick);
        document.removeEventListener("mousedown", handleOutsideClick);
      };
    }, [handleClick]);

    const handleAddAlternative = () => {
      if (selectedComponent.key) {
        setAlternativeLabels((prev) => ({
          ...prev,
          [selectedComponent.key]: {
            altVariable: selectedComponent.altVariable,
            labelOfComponent: selectedComponent.label,
            type:selectedComponent.type,
            key:selectedComponent.key,
          },
        }));
        const highlightedElement = document.querySelector(".formio-hilighted");
        if (highlightedElement) {
          highlightedElement.classList.remove("formio-hilighted");
        }
      }
      setShowElement(false);
    };

    return (
      <div className="d-flex">
        <div className="flex-grow-1 form-hilighter form-field-container wizard-tab">
          <Form
            form={updatedForm}
            options={{
              viewAsHtml: true,
              readOnly: true,
                          }}
            showHiddenFields={false}
            formReady={(e) => {
              formRef.current = e;
            }}
          />
        </div>

        <div className="field-details-container" ref={detailsRef}>
          {showElement  && selectedComponent.key ? (
            <div className="details-section">
              <div className="d-flex flex-column">
                <span>{t("Type")}:</span>
                <span className="text-bold"> {selectedComponent.type}</span>
              </div>
              <div className="d-flex flex-column">
                <span>{t("Variable")}:</span>
                <span className="text-bold">{selectedComponent.key}</span>
                {/* TBD in case of Bundle  */}
              </div>
              <FormInput
                type="text"
                ariaLabel="Add alternative label input"
                dataTestId="Add-alternative-input"
                label="Add Alternative Label"
                value={selectedComponent.altVariable}
                onChange={(e) =>
                  setSelectedComponent((prev) => ({
                    ...prev,
                    altVariable: e.target.value,
                  }))
                }
              />
              <CustomButton
                dataTestId="Add-alternative-btn"
                ariaLabel="Add alternative label button"
                size="sm"
                label={
                  alternativeLabels[selectedComponent.key]
                    ? t("Update Variable")
                    : t("Add Variable")
                }
                onClick={handleAddAlternative}
                className="w-75"
                disabled={selectedComponent.
                    altVariable === alternativeLabels[selectedComponent.key]?.altVariable} //TBD need to create a variable to compare values
              />
            </div>
          ) : (
            <p className="select-text">{t("Select a form field on the left")}</p>
          )}
        </div>
      </div>
    );
  }
);
// PropTypes for FormComponent
FormComponent.propTypes = {
  form: PropTypes.object.isRequired,
  alternativeLabels: PropTypes.object.isRequired,
  setAlternativeLabels: PropTypes.func.isRequired,
  selectedComponent: PropTypes.object.isRequired,
  setSelectedComponent: PropTypes.func.isRequired,
};
/* --------------------------- end form component --------------------------- */

const TaskVariableModal = React.memo(
  ({ showTaskVarModal, isPublished = false ,onClose, layoutNotsaved, handleCurrentLayout }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const formProcessList = useSelector(
      (state) => state.process.formProcessList
    );

    const form = useSelector((state) => state.form?.form || {});
    const [alternativeLabels, setAlternativeLabels] = useState({});

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
      setAlternativeLabels(updatedLabels);
    }, [formProcessList]);

    const [selectedComponent, setSelectedComponent] = useState({
        key: null,
        type: "",
        label: "",
        altVariable: "",
      });

    const removeSelectedVariable = useCallback((key) => {
        setSelectedComponent((prev) => ({
            ...prev,
            altVariable: "",
          }));
      setAlternativeLabels((prev) => {
        const newLabels = { ...prev };
        delete newLabels[key];
        return newLabels;
      });

    }, []);

    const handleClose = () => onClose();

    const handleSaveTaskVariable = async() => {
      const currentTaskVariables = Object.values(alternativeLabels).map(
        (i) => ({
          key: i.key,
          label: i.altVariable || i.labelOfComponent,    // If altVariable exists, use it, otherwise it will be  labelOfComponent
          type: i.type
        })
      );
      const mapper = {
        formId: formProcessList.formId,
        id: formProcessList.id,
        parentFormId: formProcessList.parentFormId,
        taskVariables:currentTaskVariables,
        formName: formProcessList.formName
      };
       await dispatch(saveFormProcessMapperPut({ mapper}));
       onClose();
    };

    const handleBackToLayout = () => {
      handleClose();
      handleCurrentLayout();
    };
    // Define the content for when layoutNotsaved is true
    const layoutNotSavedContent = (
      <>
        <CustomButton
          variant="primary"
          size="md"
          className=""
          label={t("Back to Layout")}
          ariaLabel="Back to Layout btn"
          dataTestId="back-to-layout-btn"
          onClick={handleBackToLayout}
        />
        <CustomButton
          variant="secondary"
          size="md"
          className=""
          label={t("Cancel")}
          ariaLabel="Cancel btn"
          dataTestId="cancel-btn"
          onClick={handleClose}
        />
      </>
    );

    // Define the content for when layoutNotsaved is false
    const layoutSavedContent = (
      <>
        <CustomButton
          variant="primary"
          size="md"
          className=""
          disabled={isPublished}
          label={t("Save")}
          ariaLabel="save task variable btn"
          dataTestId="save-task-variable-btn"
          onClick={handleSaveTaskVariable}
        />
        <CustomButton
          variant="secondary"
          size="md"
          className=""
          label={t("Cancel")}
          ariaLabel="Cancel btn"
          dataTestId="cancel-btn"
          onClick={handleClose}
        />
      </>
    );

    return (
      <Modal
        show={showTaskVarModal}
        onHide={handleClose}
        className="task-variable-modal"
        size={layoutNotsaved ? "sm" : "lg"}
        centered={true}
        data-testid="task-variable-modal"
      >
        <Modal.Header>
          <Modal.Title>
            {layoutNotsaved
              ? t("Selecting Variables Is Not Available")
              : t("Variables for Flow, Submissions, and Tasks")}
          </Modal.Title>
          <div className="d-flex align-items-center">
            <CloseIcon width="16.5" height="16.5" onClick={handleClose} />
          </div>
        </Modal.Header>
        <Modal.Body>
          {layoutNotsaved ? (
            // Content when layoutNotsaved is true
            <div className="info-pill-container">
              <CustomInfo
                heading={t("Note")}
                content={t(
                  "Variables can be accessed only when there are no pending changes to the layout. Please go back to the layout section and save or discard your changes."
                )}
              />
            </div>
          ) : (
            // Content when layoutNotsaved is false
            <>
              <div className="info-pill-container">
                <CustomInfo
                  heading={t("Note")}
                  content={t("To use variables in the flow, as well as sorting by them in the submissions and tasks you need to specify which variables you want to import from the layout. Variables get imported into the system at the time of the submission, if the variables that are needed are not selected prior to the form submission THEY WILL NOT BE AVAILABLE in the flow, submissions, and tasks.")}
                />
                <div>
                  <label className="selected-var-text">
                    {t("Selected Variables")}
                  </label>
                  <PillList
                    alternativeLabels={alternativeLabels}
                    onRemove={removeSelectedVariable}
                  />
                </div>
              </div>
              <div className="variable-container">
                <FormComponent
                  form={form}
                  alternativeLabels={alternativeLabels}
                  setAlternativeLabels={setAlternativeLabels}
                  setSelectedComponent={setSelectedComponent}
                  selectedComponent={selectedComponent}
                />
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {layoutNotsaved ? layoutNotSavedContent : layoutSavedContent}
        </Modal.Footer>
      </Modal>
    );
  }
);

// PropTypes for TaskVariableModal
TaskVariableModal.propTypes = {
  showTaskVarModal: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isPublished: PropTypes.bool.isRequired,
  layoutNotsaved: PropTypes.bool.isRequired,
  handleCurrentLayout: PropTypes.func.isRequired,
};
export default TaskVariableModal;
