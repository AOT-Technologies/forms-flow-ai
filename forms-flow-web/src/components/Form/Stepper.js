import React, { PureComponent } from "react";
import { connect } from "react-redux";
import {  Row, Col, Button } from 'react-bootstrap';
import { toast } from "react-toastify";
import Create from "./Create.js";
import Preview from "./Item/Preview.js";
import Edit from "./Item/Edit.js";
import { Translation, withTranslation } from "react-i18next";
import "../../resourceBundles/i18n";

//TODO convert this code to functional component

// for edit
import {
  fetchAllBpmProcesses,
  getApplicationCount,
  getFormProcesses,
  resetFormProcessData,
  saveFormProcessMapperPost,
  saveFormProcessMapperPut,
} from "../../apiManager/services/processServices";
import { selectRoot, selectError, Formio, getForm } from "react-formio";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import { push } from "connected-react-router";
import WorkFlow from "./Steps/WorkFlow";
import PreviewStepper from "./Steps/PreviewStepper";
import Stepper from "../../containers/Stepper/index.js";
import "./stepper.scss";
import { Link } from "react-router-dom";
import {
  FORM_CREATE_ROUTE,
  STEPPER_ROUTES,
} from "./constants/stepperConstants";
import { resetFormData, setFormAuthVerifyLoading, setFormAuthorizationDetails } from "../../actions/formActions.js";
import Loading from "../../containers/Loading.js";
import { fetchFormAuthorizationDetials } from "../../apiManager/services/authorizationService.js";
import { setApiCallError } from "../../actions/ErroHandling.js";
import NotFound from "../NotFound/index.js";
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
      checkPermissionLoading: false,
    };

    this.setPreviewMode = this.setPreviewMode.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handleCheckPermissionLoading =
      this.handleCheckPermissionLoading.bind(this);
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
        Formio.cache = {};
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

    if (["view-edit", "preview"].includes(nextProps.match.params.step)) {
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

  handleCheckPermissionLoading() {
    this.setState({
      checkPermissionLoading: !this.state?.checkPermissionLoading,
    });
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
      parentFormId: formProcessList?.parentFormId,
      formType: formProcessList.formType,
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

    data.workflowChanged = data?.processKey !== formPreviousData.processKey;
    data.statusChanged = processData?.status !== formPreviousData.status;

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
          return <Edit />;
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
    const { t, formAuthVerifyLoading, apiCallError, match } = this.props;
    const handleReset = () => {
      this.setActiveStep(0);
    };

    if (formAuthVerifyLoading && match?.params.formId !== FORM_CREATE_ROUTE) {
      return <Loading />;
    }

    if (apiCallError) {
      return (
        <NotFound
          errorMessage={apiCallError.message}
          errorCode={apiCallError.status}
        />
      );
    }

    return (
      <>
        <div>
          {this.props.isAuthenticated ? (
            <Link
              to={`${this.state.redirectUrl}form`}
              title={t("Back to Form List")}
              data-testid="back-to-form-list"
            >
              <i className="fa fa-chevron-left fa-lg m-2" />
            </Link>
          ) : null}
          <div className="paper-root">
            <Row>
              <Col xs={12}>
                <div className="mb-3">
                  <Stepper steps={steps} activeStep={this.state.activeStep}/>
                </div>
                <div>
                  {this.state.activeStep === steps.length ? (
                    <div>
                      <h3>
                        <Translation>
                          {(t) => t("All steps completed - you're finished")}
                        </Translation>
                      </h3>
                      <Button onClick={handleReset}>Reset</Button>
                    </div>
                  ) : (
                    <div>{this.getStepContent(this.state.activeStep)}</div>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        </div >
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
    formAuthVerifyLoading: state.process?.formAuthVerifyLoading,
    applicationCount: state.process?.applicationCount,
    apiCallError: state.errors?.apiCallError,
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
        fetchAllBpmProcesses({tenant_key:tenantIdIn}, (err, res) => {
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
                {(t) => t("Form-Workflow association saved.")}
              </Translation>
            );
            dispatch(push(`${redirectUrl}form`));
            dispatch(resetFormProcessData());
          } else {
            toast.error(
              <Translation>
                {(t) => t("Form-Workflow association failed.")}
              </Translation>
            );
          }
        })
      );
    },

    getForm: (id) => {
      dispatch(setApiCallError(null));
      dispatch(resetFormData("form", id));
      dispatch(setFormAuthVerifyLoading(true));
      dispatch(
        getForm("form", id, (err, res) => {
          if (err) {
            const { response } = err;
            dispatch(
              setApiCallError({
                message:
                  response?.data?.message ||
                  "Bad Request" ||
                  response?.statusText ||
                  err.message,
                status: response?.status || "400",
              })
            );
            dispatch(setFormAuthVerifyLoading(false));
          } else {
            fetchFormAuthorizationDetials(res?.parentFormId || res._id)
              .then((response) => {
                dispatch(setFormAuthorizationDetails(response.data));
              })
              .catch((err) => {
                const { response } = err;
                dispatch(
                  setApiCallError({
                    message:
                      response?.data?.message ||
                      response?.statusText ||
                      err.message,
                    status: response?.status || "400",
                  })
                );
              })
              .finally(() => {
                dispatch(setFormAuthVerifyLoading(false));
              });
          }
        })
      );
    },
    getFormProcessesDetails: (formId) => {
      dispatch(
        // eslint-disable-next-line no-unused-vars
        getFormProcesses(formId, (err, data) => {
          if (!err) {
            dispatch(getApplicationCount(data.id));
          } else {
            console.error(err);
          }
        })
      );
    },
    goToPageNotFound: () => dispatch(push(`/404`)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(StepperPage));
