import React, { PureComponent } from "react";
import { connect } from "react-redux";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { toast } from "react-toastify";

import Create from "./Create.js";
import Preview from "./Item/Preview.js";
import Edit from "./Item/Edit.js";
import { Translation } from "react-i18next";
import "../../resourceBundles/i18n";

//TODO convert this code to functional component

// for edit
import {
  fetchAllBpmProcesses,
  getFormProcesses,
  resetFormProcessData,
  saveFormProcessMapperPost,
  saveFormProcessMapperPut,
} from "../../apiManager/services/processServices";
import { selectRoot, selectError, getForm } from "react-formio";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import { push } from "connected-react-router";
import WorkFlow from "./Steps/WorkFlow";
import PreviewStepper from "./Steps/PreviewStepper";

import "./stepper.scss";
import { Link } from "react-router-dom";
import {
  FORM_CREATE_ROUTE,
  STEPPER_ROUTES,
} from "./constants/stepperConstants";
import { resetFormData } from "../../actions/formActions.js";
class StepperPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // checked: false,
      activeStep: 0,
      previewMode: false,
      editMode: false,
      processData: {
        status: props.formProcessList.status,
        comments: props.formProcessList.comments,
      },
      formId: "",
      processList: [],
      processListLoaded: false,
      displayMode: "create",
      dataModified: false,
      disableWorkflowAssociation: false,
      disablePreview: false,
      tenantKey: props.tenants?.tenantId,
      redirectUrl: null,
    };
    this.setPreviewMode = this.setPreviewMode.bind(this);
    this.handleNext = this.handleNext.bind(this);
    // for edit
    this.setEditMode = this.setEditMode.bind(this);
    this.handleBack = this.handleBack.bind(this);
    this.handleEditAssociation = this.handleEditAssociation.bind(this);
    this.handleEditPreview = this.handleEditPreview.bind(this);
    this.setRedirectUrl = this.setRedirectUrl.bind(this);
  }

  componentDidMount() {
    if (this.state && this.state.displayMode === "view") {
      this.setState({ disableWorkflowAssociation: true });
      this.setState({ disablePreview: true });
    }
    this.setRedirectUrl();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let stateData = null;
    if (
      nextProps.match.params.step !== undefined &&
      !STEPPER_ROUTES.includes(nextProps.match.params.step)
    ) {
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
      nextProps.getAllProcesses(prevState.tenantKey);
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
        stateData = {
          ...stateData,
          processData: {
            status: nextProps.formProcessList.status || "inactive",
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
  }
  handleEditPreview() {
    this.setState({ disablePreview: false });
  }
  setRedirectUrl() {
    this.setState({
      redirectUrl: MULTITENANCY_ENABLED
        ? `/tenant/${this.state?.tenantKey}/`
        : "/",
    });
  }
  // handleCheckboxChange = (event) =>
  //   this.setState({ checked: event.target.checked });

  setProcessData = (data) => {
    this.setState((prevState) => ({
      processData: { ...prevState.processData, ...data },
      dataModified: true,
    }));
  };

  getSteps() {
    return [
      <Translation key={1}>{(t) => t("Design Form")}</Translation>,
      <Translation key={2}>
        {(t) => t("Associate this form with a workflow?")}
      </Translation>,
      <Translation key={3}>{(t) => t("Preview and Confirm")}</Translation>,
    ];
  }

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

  handleBack() {
    this.setActiveStep(this.state.activeStep - 1);
  }

  submitData = () => {
    const {
      form,
      onSaveFormProcessMapper,
      formProcessList,
      formPreviousData,
      applicationCount,
      workflow,
    } = this.props;
    const { processData } = this.state;

    let saveMethod = saveFormProcessMapperPut;

    const isNewVersionNeeded = () => {
      // New mapper version is needed if the form metadata is updated and applications exist with old data.
      return (
        (data.processName !== formPreviousData.processName ||
          data.processKey !== formPreviousData.processKey ||
          formPreviousData.isTitleChanged) &&
        applicationCount > 0
      );
    };
    const data = {
      formId: form.id,
      formName: form.form && form.form.title,
      status: processData.status ? processData.status : "inactive",
      taskVariable: formProcessList.taskVariable
        ? formProcessList.taskVariable
        : [],
      anonymous: formProcessList.anonymous ? true : false,
    };

    if (workflow) {
      data["processKey"] = workflow && workflow.value;
      data["processName"] = workflow && workflow.label;
    } else {
      data["processKey"] = "";
      data["processName"] = "";
    }

    if (processData.comments) {
      data["comments"] = processData.comments;
    }

    if (formProcessList && formProcessList.id) {
      data.id = formProcessList.id;
    }

    if (isNewVersionNeeded()) {
      // POST request for creating new mapper version of the current form.

      data["version"] = String(+formProcessList.version + 1);
      saveMethod = saveFormProcessMapperPost;
    } else {
      if (formProcessList && formProcessList.id) {
        // PUT request to modify the existing mapper if there is one.

        saveMethod = saveFormProcessMapperPut;
      } else {
        // For hadling uploaded forms case
        // There won't be any mapper in case of uploaded forms

        saveMethod = saveFormProcessMapperPost;
      }
    }

    onSaveFormProcessMapper(data, saveMethod, this.state.redirectUrl);
  };

  getStepContent(step) {
    const { previewMode, editMode, processData, activeStep } = this.state;
    // const { editMode } = this.state;
    const { form, formProcessList, workflow } = this.props;

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
            handleNext={this.handleNext}
            handleBack={this.handleBack}
            handleEditAssociation={this.handleEditAssociation}
            activeStep={activeStep}
            steps={this.getSteps().length}
            formProcessList={formProcessList}
            disableWorkflowAssociation={this.state.disableWorkflowAssociation}
          />
        );
      case 2:
        return (
          <PreviewStepper
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
          {this.props.isAuthenticated ? (
            <Link
              to={`${this.state.redirectUrl}form`}
              title={<Translation >
              {(t) => t("Back to Form List")}
            </Translation>}
            >
              <i className="fa fa-chevron-left fa-lg m-3" />
            </Link>
          ) : null}
          <div className="paper-root">
            <Grid
              container
              direction="row"
              justify="flex-start"
              alignItems="baseline"
            >
              <Grid item xs={12} spacing={3}>
                <Stepper
                  alternativeLabel
                  nonLinear
                  activeStep={this.state.activeStep}
                >
                  {steps.map((label, index) => {
                    return (
                      <Step key={index}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    );
                  })}
                </Stepper>
                <div>
                  {this.state.activeStep === steps.length ? (
                    <div>
                      <Typography>
                        <Translation>
                          {(t) => t("All steps completed - you're finished")}
                        </Translation>
                      </Typography>
                      <Button onClick={handleReset}>Reset</Button>
                    </div>
                  ) : (
                    <div>{this.getStepContent(this.state.activeStep)}</div>
                  )}
                </div>
              </Grid>
            </Grid>
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    form: selectRoot("form", state),
    saveText: <Translation>{(t) => t("Next")}</Translation>,
    errors: selectError("form", state),
    processList: state.process.processList,
    formProcessList: state.process.formProcessList,
    isAuthenticated: state.user.isAuthenticated,
    formPreviousData: state.process.formPreviousData,
    applicationCount: state.process.applicationCount,
    tenants: state.tenants,
    workflow: state.process.workflowAssociated,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getAllProcesses: (tenantKey) => {
    const tenantIdIn = MULTITENANCY_ENABLED ? tenantKey : null;
      dispatch(
        // eslint-disable-next-line no-unused-vars
        fetchAllBpmProcesses(tenantIdIn, (err, res) => {
          if (err) {
            console.log(err);
          }
        })
      );
    },
    onSaveFormProcessMapper: (data, saveMethod, redirectUrl) => {
      dispatch(
        // eslint-disable-next-line no-unused-vars
        saveMethod(data, (err, res) => {
          if (!err) {
            toast.success(
              <Translation>
                {(t) => t("Form Workflow Association Saved.")}
              </Translation>
            );
            dispatch(push(`${redirectUrl}form`));
            dispatch(resetFormProcessData());
          } else {
            toast.error(
              <Translation>
                {(t) => t("Form Workflow Association Failed.")}
              </Translation>
            );
          }
        })
      );
    },

    getForm: (id) => {
      dispatch(resetFormData("form", id));
      dispatch(getForm("form", id));
    },
    getFormProcessesDetails: (formId) => {
      dispatch(
        // eslint-disable-next-line no-unused-vars
        getFormProcesses(formId, (err, res) => {
          if (err) {
            console.log(err);
          }
        })
      );
    },
    goToPageNotFound: () => dispatch(push(`/404`)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StepperPage);
