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
import { Form } from "@aot-technologies/formio-react";
import PropTypes from "prop-types";


//TBD in case of Bundle form display
const PillList = React.memo(({ alternativeLabels, onRemove }) => {
  const { t } = useTranslation();
  return (
    <div className="pill-container">
      {Object.entries(alternativeLabels).length > 0 ? (
        Object.entries(alternativeLabels).map(
          ([key, { altVariable, labelOfComponent }], index) => (
            <CustomPill
              key={key}
              label={altVariable || labelOfComponent}
              icon={<CloseIcon color="#253DF4" data-testid="pill-remove-icon" />}
              bg="#E7E9FE"
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
const FormComponent = React.memo(
  ({ form, 
    alternativeLabels, 
    setAlternativeLabels,
    selectedComponent,
    setSelectedComponent
 }) => {
    const [showElement, setShowElement] = useState(false);
    const formRef = useRef(null);
    const { t } = useTranslation();
    
    const handleClick = useCallback(
      (e) => {
        setShowElement(true);
        const formioComponent = e.target.closest(".formio-component");
        const highlightedElement = document.querySelector(".formio-hilighted");

        if (highlightedElement) {
          highlightedElement.classList.remove("formio-hilighted");
        }

        if (formioComponent) {
          formioComponent.classList.add("formio-hilighted");

          let classes = Array.from(formioComponent.classList);
          classes = classes.filter((cls) =>
            cls.startsWith("formio-component-")
          );
          const typeClass = classes[classes.length - 2];
          const keyClass = classes[classes.length - 1];
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

          const componentKey = keyClass?.split("-").pop();
          const componentType = typeClass?.split("-").pop();
          setSelectedComponent({
            key: componentKey,
            type: componentType,
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
      [alternativeLabels]
    );

    useEffect(() => {
      const formHilighter = document.querySelector(".form-hilighter");

      formHilighter?.addEventListener("click", handleClick);

      return () => {
        formHilighter?.removeEventListener("click", handleClick);
      };
    }, [handleClick]);

    const handleAddAlternative = () => {
      if (selectedComponent.key) {
        setAlternativeLabels((prev) => ({
          ...prev,
          [selectedComponent.key]: {
            altVariable: selectedComponent.altVariable,
            labelOfComponent: selectedComponent.label,
          },
        }));
      }
      setShowElement(false);
    };

    return (
      <div className="d-flex">
        <div className="flex-grow-1 form-hilighter form-field-container">
          <Form
            form={form}
            options={{
              viewAsHtml: true,
              readOnly: true,
            }}
            formReady={(e) => {
              formRef.current = e;
            }}
          />
        </div>

        <div className="field-details-container">
          {showElement ? (
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
                dataTestid="Add-alternative-input"
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
                dataTestid="Add-alternative-btn"
                ariaLabel="Add alternative label button"
                size="sm"
                label={
                  alternativeLabels[selectedComponent.key]?.altVariable
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
const TaskVariableModal = React.memo(
  ({ showTaskVarModal, onClose, form, setTaskVariable, taskVariable }) => {
    const { t } = useTranslation();
    const [alternativeLabels, setAlternativeLabels] = useState(() => {
      const initialLabels = {};
      taskVariable.forEach(({ key, label }) => {
        initialLabels[key] = { altVariable: label, labelOfComponent: label };
      });
      return initialLabels;
    });
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

    const handleSaveTaskVariable = () => {
      const taskVariables = Object.entries(alternativeLabels).map(
        ([key, { altVariable, labelOfComponent }]) => ({
          key: key,
          label: altVariable || labelOfComponent, // If altVariable exists, use it, otherwise it will be  labelOfComponent
        })
      );

      setTaskVariable(taskVariables);
      onClose();
    };

    return (
      <Modal
        show={showTaskVarModal}
        onHide={handleClose}
        className="task-variable-modal"
        size="lg"
        centered={true}
      >
        <Modal.Header>
          <Modal.Title>
            {t("Variables for Flow, Submissions, and Tasks")}
          </Modal.Title>
          <div className="d-flex align-items-center">
            <CloseIcon width="16.5" height="16.5" onClick={handleClose} />
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="info-pill-container">
            <CustomInfo
              heading="Note"
              content="To use variables in the flow, as well as sorting by them in 
        the submissions and tasks you need to specify which variables you want to import from the layout. Variables get imported into the system at the time of the submission, if the variables that are needed 
        are not selected prior to the form submission THEY WILL NOT BE AVAILABLE in the flow, submissions, and tasks."
            />
            <div>
              <label className="selected-var-text">{t("Selected Variables")}</label>
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
        </Modal.Body>
        <Modal.Footer>
          <CustomButton
            variant="primary"
            size="md"
            className=""
            label={t("Save")}
            ariaLabel="save task variable btn"
            dataTestid="save-task-variable-btn"
            onClick={handleSaveTaskVariable}
          />
          <CustomButton
            variant="secondary"
            size="md"
            className=""
            label={t("Cancel")}
            ariaLabel="Cancel btn"
            dataTestid="Cancel-btn"
            onClick={handleClose}
          />
        </Modal.Footer>
      </Modal>
    );
  }
);

// PropTypes for TaskVariableModal
TaskVariableModal.propTypes = {
  showTaskVarModal: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  setTaskVariable: PropTypes.func.isRequired,
  taskVariable: PropTypes.array.isRequired,
};
export default TaskVariableModal;
