import React, { Component } from "react";
import { connect } from "react-redux";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { Grid, Paper } from "@material-ui/core";
import Create from "./Create.js";
import Preview from "./Item/Preview.js";
import Edit from "./Item/Edit.js";

// for edit
import {
  fetchAllBpmProcesses,
  getFormProcesses,
} from "../../apiManager/services/processServices";
import { saveFormProcessMapper } from "../../apiManager/services/formServices";
import { selectRoot, saveForm, selectError, getForm } from "react-formio";
import { SUBMISSION_ACCESS } from "../../constants/constants";
import { push } from "connected-react-router";
import WorkFlow from "./Steps/WorkFlow";
import PreviewStepper from "./Steps/PreviewStepper";

import "./stepper.scss";

/*const statusList = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];*/

const initialState = {
  // checked: false,
  activeStep: 0,
  workflow: null,
  status: null,
  previewMode: false,
  editMode: false,
  associateWorkFlow: "no",
  processData: { status: "", isAnonymousAllowd: false, comments: "" },
  formId: "",
  processList: [],
  processListLoaded: false,
  displayMode: "create",
  dataModified: false,
  formProcessList: null,
  disableWorkflowAssociation: false
};

class StepperPage extends Component {
  // UNSAFE_componentWillMount() {
  //   this.props.getAllProcesses();
  // }

  constructor(props) {
    super(props);
    this.state = initialState;
    this.setState({ disableWorkflowAssociation: props.disableWorkflowAssociation});
    this.setPreviewMode = this.setPreviewMode.bind(this);
    this.handleNext = this.handleNext.bind(this);
    // for edit
    this.setEditMode = this.setEditMode.bind(this);
    this.populateDropdown = this.populateDropdown.bind(this);
    this.handleBack = this.handleBack.bind(this);
    this.handleEditAssociation = this.handleEditAssociation.bind(this);
    
  }

  reset() {
    this.setState(initialState);
  }


  static getDerivedStateFromProps(nextProps, prevState) {
    let stateData = null;
    if (
      nextProps.match.params.formId &&
      nextProps.match.params.formId !== prevState.formId
    ) {
      if (nextProps.match.params.formId !== "create") {
        nextProps.getForm(nextProps.match.params.formId);
        nextProps.getFormProcessesDetails(nextProps.match.params.formId);
      }
    }

    if (!prevState.processListLoaded) {
      stateData = {
        ...stateData,
        processList: nextProps.processList,
        processListLoaded: true,
      };
      nextProps.getAllProcesses();
    }
    if (
      nextProps.match.params.formId === "create" &&
      nextProps.match.params.step === undefined
    ) {
      stateData = {
        ...stateData,
        editMode: false,
        formId: "",
        previewMode: false,
      };
    } else if (nextProps.match.params.step === "edit") {
      stateData = {
        ...stateData,
        formId: nextProps.match.params.formId,
        editMode: true,
        previewMode: false,
      };
    } else {
      stateData = {
        ...stateData,
        formId: nextProps.match.params.formId,
        editMode: false,
        previewMode: true,
      };
    }

    if (nextProps.match.params.step === "view-edit") {
      stateData = {
        ...stateData,
        displayMode: "view",
      };

      if (!prevState.dataModified && nextProps.formProcessList) {
        if (nextProps.formProcessList.processKey) {
          console.log('set associate flag yes>>');
          stateData = {
            ...stateData,
            workflow: {
              label: nextProps.formProcessList.processName,
              value: nextProps.formProcessList.processKey,
            },
            associateWorkFlow: "yes",
          };
        }

        stateData = {
          ...stateData,
          processData: {
            status: nextProps.formProcessList.status,
            isAnonymousAllowd: false,
            comments: nextProps.formProcessList.comments,
          },
        };
      }
    }

    return { ...stateData };

    // else {
    //   return { editMode: false, formId: "" };
    // }
  }

  setActiveStep(val) {
    this.setState({ activeStep: val });
  }
  setPreviewMode(val) {
    this.setState({ previewMode: val });
  }
  setEditMode(val) {
    this.setState({ editMode: val });
  }
  handleEditAssociation() {
    console.log('inside handleEditAssociation');
    this.setState({ disableWorkflowAssociation: false });
  };

  // handleCheckboxChange = (event) =>
  //   this.setState({ checked: event.target.checked });
  changeWorkFlowStatus = (e) => {
    this.setState({ associateWorkFlow: e.target.value });
  };

  setProcessData = (data) => {
    this.setState((prevState) => ({
      processData: { ...prevState.processData, ...data },
      dataModified: true,
    }));
  };

  getSteps() {
    return [
      "Design Form",
      "Associate this form with a workflow?",
      "Preview and Confirm",
    ];
  }

  populateDropdown() {
    const listProcess = (processes) => {
      if (processes.length > 0) {
        const data = processes.map((process) => {
          return {
            label: process.name,
            value: process.key,
          };
        });
        return data;
      } else {
        return [];
      }
    };

    return listProcess(this.props.processList);
  }

  // populateStatusDropdown() {
  //   const list = [
  //     { label: "Active", value: "active" },
  //     { label: "Inactive", value: "inactive" },
  //   ];
  //   return list;
  // }

  associateToWorkFlow = (item) => {
    this.setState({ workflow: item[0], dataModified: true });
  };

  handleEdit() {
    this.setState((editState) => ({
      activeStep: editState.activeStep + 1,
    }));
  }
  handleNext() {
    this.setState((prevState) => ({
      activeStep: prevState.activeStep + 1,
    }));
  }
  setSelectedStatus(item) {
    this.setState({ status: item[0] });
    //code to link form to a workflow
  }
  handleBack() {
    this.setActiveStep(this.state.activeStep - 1);
  }

  submitData = () => {
    const { form, onSaveFormProcessMapper, formProcessList } = this.props;
    const { workflow, processData } = this.state;
    // if (associateWorkFlow === "yes") {
    const data = {
      formId: form.id,
      formName: form.form && form.form.title,
      formRevisionNumber: "V1", // to do
      processKey: workflow && workflow.value,
      processName: workflow && workflow.label,
      status: processData.status,
      comments: processData.comments,
    };
    const isUpdate = formProcessList && formProcessList.id ? true : false;
    if (isUpdate) {
      data.id = formProcessList.id;
    }
    onSaveFormProcessMapper(data, isUpdate);
  };

  getStepContent(step) {
    const {
      previewMode,
      editMode,
      processData,
      activeStep,
      workflow
    } = this.state;
    // const { editMode } = this.state;
    const { form, formProcessList } = this.props;

    switch (step) {
      case 0:
        // return(
        // previewMode ? <Preview/> : <Create/> ;
        if (previewMode) {
          return <Preview handleNext={this.handleNext} />;
        } else if (editMode) {
          return (
            <Edit
              handleNext={this.handleNext}
              {...this.props}
              setPreviewMode={this.setPreviewMode}
            />
          );
        }
        return <Create setPreviewMode={this.setPreviewMode} />;
      case 1:
        console.log('this.state.workflow ',this.state.workflow);
        console.log('this.state.workflow ',this.state.workflow);
        return (
          <WorkFlow
            associateWorkFlow={this.state.associateWorkFlow}
            changeWorkFlowStatus={this.changeWorkFlowStatus}
            populateDropdown={this.populateDropdown}
            associateToWorkFlow={this.associateToWorkFlow}
            handleNext={this.handleNext}
            handleBack={this.handleBack}
            handleEditAssociation={this.handleEditAssociation}
            activeStep={activeStep}
            steps={this.getSteps().length}
            workflow={this.state.workflow}
            formProcessList={formProcessList}
            disableWorkflowAssociation={this.state.disableWorkflowAssociation}
          />
        );
      case 2:
        return (
          <PreviewStepper
            associateWorkFlow={this.state.associateWorkFlow}
            setSelectedStatus={this.setSelectedStatus}
            handleNext={this.handleNext}
            handleBack={this.handleBack}
            activeStep={activeStep}
            steps={this.getSteps().length}
            processData={processData}
            setProcessData={this.setProcessData}
            formData={form}
            workflow={workflow}
            submitData={this.submitData}
            formProcessList={formProcessList}
          />
        );
      default:
        return "Unknown step";
    }
  }

  render() {
    // const { process } = this.props;

    const steps = this.getSteps();

    const handleReset = () => {
      this.setActiveStep(0);
    };

    return (
      <>
        <div>
          <Paper elevation={3} className="paper-root">
            <Grid
              container
              direction="row"
              justify="flex-start"
              alignItems="baseline"
            >
              {" "}
              <Grid item xs={12} spacing={3}>
                <Stepper
                  alternativeLabel
                  nonLinear
                  activeStep={this.state.activeStep}
                >
                  {steps.map((label, index) => {
                    return (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    );
                  })}
                </Stepper>
                <div>
                  {this.state.activeStep === steps.length ? (
                    <div>
                      <Typography>
                        All steps completed - you're finished
                      </Typography>
                      <Button onClick={handleReset}>Reset</Button>
                    </div>
                  ) : (
                    <div>{this.getStepContent(this.state.activeStep)}</div>
                  )}
                </div>
              </Grid>
            </Grid>
          </Paper>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  console.log('formProcessList ',state.process.formProcessList);
  let disableEdit = false;
  if(state.process.formProcessList && state.process.formProcessList.processKey){
    disableEdit=true;
  }
  return {
    form: selectRoot("form", state),
    saveText: "Next",
    errors: selectError("form", state),
    processList: state.process.processList,
    formProcessList: state.process.formProcessList,
    disableWorkflowAssociation: disableEdit
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getAllProcesses: () => {
      dispatch(
        fetchAllBpmProcesses((err, res) => {
          if (!err) {
            console.log(err);
          }
        })
      );
    },
    onSaveFormProcessMapper: (data, update) => {
      dispatch(
        saveFormProcessMapper(data, update, (err, res) => {
          if (!err) {
            dispatch(push(`/form`));
          }
        })
      );
    },

    saveForm: (form) => {
      const newForm = {
        ...form,
        tags: ["common"],
      };
      newForm.submissionAccess = SUBMISSION_ACCESS;
      dispatch(
        saveForm("form", newForm, (err, form) => {
          if (!err) {
            dispatch(push(`/form/${form._id}/preview`));
          }
        })
      );
    },
    getForm: (id) => dispatch(getForm("form", id)),
    getFormProcessesDetails: (formId) => {
      dispatch(
        getFormProcesses(formId, (err, res) => {
          if (!err) {
            console.log(err);
          }
        })
      );
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StepperPage);
