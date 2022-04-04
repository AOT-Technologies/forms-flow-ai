import React, {PureComponent} from "react";
import { connect } from "react-redux";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { toast } from 'react-toastify';
import Back from "./constants/Back.js";
import Create from "./Create.js";
import Preview from "./Item/Preview.js";
import Edit from "./Item/Edit.js";
import { Translation } from "react-i18next";
import "../../translations/i18n";
//import { formio_translation } from "../../translations/formiotranslation";
//TODO convert this code to functional component

// for edit
import {
  fetchAllBpmProcesses,
  getFormProcesses,
  saveFormProcessMapper
} from "../../apiManager/services/processServices";
import {
  setFormProcessesData
} from "../../actions/processActions";
//import { saveFormProcessMapper } from "../../apiManager/services/formServices";
import { selectRoot, saveForm, selectError, getForm } from "react-formio";
import { SUBMISSION_ACCESS } from "../../constants/constants";
import { push } from "connected-react-router";
import WorkFlow from "./Steps/WorkFlow";
import PreviewStepper from "./Steps/PreviewStepper";
import "./stepper.scss";
import {FORM_CREATE_ROUTE, STEPPER_ROUTES} from "./constants/stepperConstants";
//import { Form } from "react-formio/lib/components";

/*const statusList = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];*/

class StepperPage extends PureComponent {
  // UNSAFE_componentWillMount() {
  //   this.props.getAllProcesses();
  // }

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
      processData: { status: "inactive", comments: "" },
      formId: "",
      processList: [],
      processListLoaded: false,
      displayMode: "create",
      dataModified: false,
      disableWorkflowAssociation: false,
      disablePreview: false,
    };
    this.setPreviewMode = this.setPreviewMode.bind(this);
    this.handleNext = this.handleNext.bind(this);
    // for edit
    this.setEditMode = this.setEditMode.bind(this);
    this.populateDropdown = this.populateDropdown.bind(this);
    this.handleBack = this.handleBack.bind(this);
    this.handleEditAssociation = this.handleEditAssociation.bind(this);
    this.handleEditPreview = this.handleEditPreview.bind(this);
  }

  componentDidMount() {
    if(this.state && this.state.displayMode === "view") {
      this.setState({ disableWorkflowAssociation: true });
      this.setState({ disablePreview: true });
    }
  }

  componentWillUnmount() {
    this.props.clearFormProcessData();
  }


  static getDerivedStateFromProps(nextProps, prevState) {
    let stateData = null;
    if(nextProps.match.params.step !== undefined && !STEPPER_ROUTES.includes(nextProps.match.params.step)){
      nextProps.goToPageNotFound();
    }
    if (
      nextProps.match.params.formId &&
      nextProps.match.params.formId !== prevState.formId
    ) {
      if (nextProps.match.params.formId !== FORM_CREATE_ROUTE) {
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
      nextProps.match.params.formId === FORM_CREATE_ROUTE &&
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
            status: nextProps.formProcessList.status||"inactive",
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
    this.setState({ disableWorkflowAssociation: false });
  };
  handleEditPreview() {
    this.setState({ disablePreview: false });
  };
  // handleCheckboxChange = (event) =>
  //   this.setState({ checked: event.target.checked });
  changeWorkFlowStatus = (isWorkFlowAssociated) => {
    this.setState({workflow:null, associateWorkFlow: isWorkFlowAssociated, dataModified:true});
  };

  setProcessData = (data) => {
    this.setState((prevState) => ({
      processData: { ...prevState.processData, ...data },
      dataModified: true,
    }));
  };

  getSteps() {
    return [
      <Translation>{(t)=>t(""Design Form"")}</Translation>,
      <Translation>{(t)=>t(""Associate this form with a workflow?"")}</Translation>,
      <Translation>{(t)=>t(""Preview and Confirm"")}</Translation>,
      
    ];
  }

  populateDropdown() {
    const listProcess = (processes) => {
      if (processes?.length > 0) {
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
    const { form, onSaveFormProcessMapper, formProcessList, formPreviousData ,ApplicationCount} = this.props;
    const { workflow, processData, associateWorkFlow} = this.state;
    const data = {
      formId: form.id,
      formName: form.form && form.form.title,
      status: processData.status? processData.status:"inactive",
      taskVariable:formProcessList.taskVariable?formProcessList.taskVariable:[]
    };
    
    if (associateWorkFlow === "yes" && workflow) {
      data["processKey"]= workflow && workflow.value;
      data["processName"]= workflow && workflow.label;
    }else if(associateWorkFlow === "no"){
      data["processKey"]= "";
      data["processName"]= "";
    }
    
    const processNameChecking= data.processName!==formPreviousData.processName;
    const processKeyChecking= data.processKey!==formPreviousData.processKey;
    
    if(processData.comments){
      data["comments"] = processData.comments;
    }

    let putRequest=true;
    // const isUpdate = formProcessList && formProcessList.id ? true : false;
    if(ApplicationCount > 0){
      if(formPreviousData.isTitleChanged || processKeyChecking || processNameChecking ){
      putRequest=false;
      let version = +formProcessList.version+1
      data.version = `${version}`
    }
  }
      data.id = formProcessList.id;
    onSaveFormProcessMapper(data, putRequest);
  };

  getStepContent(step) {
    const {
      previewMode,
      editMode,
      processData,
      activeStep,
      workflow,
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
            handleEditPreview={this.handleEditPreview}
            activeStep={activeStep}
            steps={this.getSteps().length}
            processData={processData}
            setProcessData={this.setProcessData}
            formData={form}
            workflow={workflow}
            submitData={this.submitData}
            formProcessList={formProcessList}
            disablePreview={this.state.disablePreview}
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
          {this.props.isAuthenticated ?
            <Back/>
            :
            null
          }
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
                      
                      
                    <Translation>{(t)=>t(""All steps completed - you're finished"")}</Translation>
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
  return {
    form: selectRoot("form", state),
    saveText: <Translation>{(t)=>t("Next")}</Translation>,
    errors: selectError("form", state),
    processList: state.process.processList,
    formProcessList: state.process.formProcessList,
    isAuthenticated: state.user.isAuthenticated,
    formPreviousData:state.process.formPreviousData,
    ApplicationCount:state.process.ApplicationCount
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getAllProcesses: () => {
      dispatch(
        fetchAllBpmProcesses((err, res) => {
          if (err) {
            console.log(err);
          }
        })
      );
    },
    onSaveFormProcessMapper: (data, update) => {
      dispatch(
        saveFormProcessMapper(data, update, (err, res) => {
          if (!err) {
            toast.success(<Translation>{(t)=>t("workflow_association")}</Translation>);
            dispatch(push(`/form`));
          }else{
            toast.error(<Translation>{(t)=>t(""Form Workflow Association Failed."")}</Translation>);
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
            toast.success(<Translation>{(t)=>t(""Form Saved"")}</Translation>);
            dispatch(push(`/formflow/${form._id}/preview`));
          }else{
            toast.error(<Translation>{(t)=>t(""Error while Submission."")}</Translation>);
          }
        })
      );
    },
    getForm: (id) => dispatch(getForm("form", id)),
    getFormProcessesDetails: (formId) => {
      dispatch(
        getFormProcesses(formId, (err, res) => {
          if (err) {
            toast.error(<Translation>{(t)=>t("'"Error in getting Workflow Process."")}</Translation>);
            console.log(err);
          }
        })
      );
    },
    clearFormProcessData: () => dispatch(setFormProcessesData([])),
    goToPageNotFound:()=>dispatch(push(`/404`))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StepperPage);
