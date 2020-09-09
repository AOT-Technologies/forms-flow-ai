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

// for edit
import { fetchAllBpmProcesses } from "../../apiManager/services/processServices";
import { saveFormProcessMapper } from "../../apiManager/services/formServices";
import { selectRoot, saveForm, selectError, Errors } from "react-formio";
import { SUBMISSION_ACCESS } from "../../constants/constants";
import { push } from "connected-react-router";
import WorkFlow from "./Steps/WorkFlow";
import PreviewStepper from "./Steps/PreviewStepper";

import "./stepper.scss";

class StepperPage extends Component {
  UNSAFE_componentWillMount() {
    this.props.getAllProcesses();
  }

  constructor(props) {
    super(props);
    this.state = {
      // checked: false,
      activeStep: 0,
      workflow: null,
      status: null,
      previewMode: false,
      editMode: false,
      associateWorkFlow: "no",
      processData: { status: "", isAnonymousAllowd: false, comments: "" },
    };
    this.setPreviewMode = this.setPreviewMode.bind(this);
    this.handleNext = this.handleNext.bind(this);
    // for edit
    this.setEditMode = this.setEditMode.bind(this);
    this.populateDropdown = this.populateDropdown.bind(this);
    this.handleBack = this.handleBack.bind(this);
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
  // handleCheckboxChange = (event) =>
  //   this.setState({ checked: event.target.checked });
  changeWorkFlowStatus = (e) => {
    this.setState({ associateWorkFlow: e.target.value });
  };

  setProcessData = (data) => {
    this.setState((prevState) => ({
      processData: { ...prevState.processData, ...data },
    }));
  };

  getSteps() {
    return [
      "Create Form",
      "Associate this form with a workflow?",
      "Preview and Conform",
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

  populateStatusDropdown() {
    const statusList = ["Active", "Inactive"];

    const statusDropdown = (statusList) => {
      const data = statusList.map((status) => {
        return {
          label: status,
          value: status,
        };
      });
      return data;
    };

    return statusDropdown(statusList);
  }

  associateToWorkFlow = (item) => {
    console.log(item[0].value);
    this.setState({ workflow: item[0] });
    //code to link form to a workflow
  };
  handleEdit() {
    this.setState((editState) => ({
      activeStep: editState.activeStep + 1,
    }));
  }
  handleNext() {
    this.setState((prevState) => ({
      activeStep: prevState.activeStep + 1,
      // console.log("formdata>>>>>"+data)
      // const data = {
      //    "formId": "5f1993f28dc3a1b73ae6b6bf",
      //    "formName": "New RPAS Self Assessment Form",
      //     "formRevisionNumber": "V1" ,
      //     "processKey": this.state.workflow.value,
      //      "processName": this.state.workflow.label,
      //      "status": this.state.status.value,
      //      "comments": "test 5555"
      //      },
    }));
  }
  setSelectedStatus(item) {
    console.log(item[0].value);
    this.setState({ status: item[0] });
    //code to link form to a workflow
  }
  handleBack() {
    this.setActiveStep(this.state.activeStep - 1);
  }

  submitData = () => {
    const { form, onSaveFormProcessMapper } = this.props;
    const { workflow, processData } = this.state;
    // if (associateWorkFlow === "yes") {
    const data = {
      formId: form.id,
      formName: form.form && form.form.name,
      formRevisionNumber: "V1",
      processKey: workflow && workflow.value,
      processName: workflow && workflow.label,
      status: processData.status,
      comments: processData.comments,
    };
    onSaveFormProcessMapper(data);
  };

  getStepContent(step) {
    const { previewMode, processData, activeStep, workflow } = this.state;
    // const { editMode } = this.state;
    const { form } = this.props;

    switch (step) {
      case 0:
        // return(
        // previewMode ? <Preview/> : <Create/> ;
        if (previewMode) {
          return <Preview handleNext={this.handleNext} />;
        }
        return <Create setPreviewMode={this.setPreviewMode} />;

        // else if(editMode){
        //     return <Edit handleNext={this.handleEdit} />
        //   }
        //   return <Create setEditMode={this.setEditMode}/>

        break;
      case 1:
        return (
          <WorkFlow
            associateWorkFlow={this.state.associateWorkFlow}
            changeWorkFlowStatus={this.changeWorkFlowStatus}
            populateDropdown={this.populateDropdown}
            associateToWorkFlow={this.associateToWorkFlow}
            handleNext={this.handleNext}
            handleBack={this.handleBack}
            activeStep={activeStep}
            steps={this.getSteps().length}
          />
        );
      case 2:
        return (
          <PreviewStepper
            associateWorkFlow={this.state.associateWorkFlow}
            setSelectedStatus={this.setSelectedStatus}
            populateStatusDropdown={this.populateStatusDropdown}
            handleNext={this.handleNext}
            handleBack={this.handleBack}
            activeStep={activeStep}
            steps={this.getSteps().length}
            processData={processData}
            setProcessData={this.setProcessData}
            formData={form}
            workflow={workflow}
            submitData={this.submitData}
          />
        );
      default:
        return "Unknown step";
    }
  }

  render() {
    const { process } = this.props;

    const steps = this.getSteps();

    // const handleNext = () => {
    //   this.setActiveStep(this.state.activeStep + 1);
    //   // this.props.saveForm(null);
    //   if(this.state.activeStep === steps.length - 1){
    //     // if(this.state.checked){
    //     //   const data = {
    //     //     "formId": "5f1993f28dc3a1b73ae6b6bf",
    //     //     "formName": "New RPAS Self Assessment Form",
    //     //     "formRevisionNumber": "V1" ,
    //     //     "processKey": this.state.workflow.value,
    //     //     "processName": this.state.workflow.label,
    //     //     "status": this.state.status.value,
    //     //     "comments": "test 5555"
    //     //   };
    //     //   this.props.onSaveFormProcessMapper(data);
    //     // }else{
    //     //   console.log('do nothing for now');
    //     // }

    //   }
    // };

    const handleReset = () => {
      this.setActiveStep(0);
    };

    return (
      <>
        <div>
          <Paper elevation={3} className="paper-root">
            {/* <AppBar position="static">
              <Toolbar
                style={{
                  alignContent: "center",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Create Form Wizard
              </Toolbar>
            </AppBar> */}
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
                    <div>
                      {this.getStepContent(this.state.activeStep)}
                      {/* <div
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                          marginLeft: 400,
                        }}
                      >
                        <div className="mt-4">
                          <Button
                            disabled={this.state.activeStep === 0}
                            onClick={this.handleBack}
                          >
                            Back
                          </Button>

                          <Button
                            variant="contained"
                            color="primary"
                            onClick={this.handleNext}
                          >
                            {this.state.activeStep === steps.length - 1
                              ? "Save"
                              : "Next"}
                          </Button>
                        </div>
                      </div> */}
                    </div>
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
  return {
    form: selectRoot("form", state),
    saveText: "Next",
    errors: selectError("form", state),
    processList: state.process.processList,
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
    onSaveFormProcessMapper: (data) => {
      dispatch(
        saveFormProcessMapper(data, (err, res) => {
          if (!err) {
            console.log(err);
          }
        })
      );
    },
    saveForm: (form) => {
      console.log("inside save stepper");
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StepperPage);
