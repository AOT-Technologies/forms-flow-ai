import React, { PureComponent } from "react";
import { connect } from "react-redux";

import { selectRoot, Form, selectError, Errors, Formio } from "react-formio";
import { push } from "connected-react-router";
import { Button } from "react-bootstrap";
import Loading from "../../../containers/Loading";
import { Translation } from "react-i18next";
import { formio_resourceBundles } from "../../../resourceBundles/formio_resourceBundles";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import {
  setFormFailureErrorData,
  setFormHistories,
  setFormSuccessData,
} from "../../../actions/formActions";
import {
  formCreate,
} from "../../../apiManager/services/FormServices";

import _ from "lodash";
import { manipulatingFormData } from "../../../apiManager/services/formFormatterService";
import { saveFormProcessMapperPost } from "../../../apiManager/services/processServices";
import { toast } from "react-toastify";
import { t } from "i18next";
import { INACTIVE } from "../constants/formListConstants";
import LoadingOverlay from "react-loading-overlay";
import FormHistoryModal from "./FormHistoryModal";
import CreateTemplateConfirmModal from "./CreateTemplateConfirmModal";
const Preview = class extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      checked: false,
      activeStep: 1,
      workflow: null,
      status: null,
      historyModal: false,
      newpublishClicked: false,
      confirmPublisModal: false,
    };
  }

 
  componentWillUnmount() {
    this.props.clearFormHistories();
  }

  handleModalChange() {
    this.setState({ ...this.state, historyModal: !this.state.historyModal });
  }

  publishConfirmModalChange () {
    this.setState({...this.state, confirmPublisModal: !this.state.confirmPublisModal });
  }
 
  

  handlePublishAsNewVersion(redirecUrl) {
    this.setState({ ...this.state, newpublishClicked: true , 
      confirmPublisModal:!this.state.confirmPublisModal});
    const { form } = this.props.form;
    const { createMapper, setFormError } = this.props;
    const { formAccess, submissionAccess } = this.props.user;
    const { tenantKey } = this.props.tenants;
    const { formProcessList } = this.props.processData;

    const newFormData = manipulatingFormData(
      _.cloneDeep(form),
      MULTITENANCY_ENABLED,
      tenantKey,
      formAccess,
      submissionAccess
    );
    const newPathAndName =
      "duplicate-version-" + Math.random().toString(16).slice(9);
    newFormData.path = newPathAndName;
    newFormData.title += "-copy";
    newFormData.name = newPathAndName;
    newFormData.componentChanged = true;
    delete newFormData.machineName;
    delete newFormData._id;
    formCreate(newFormData)
      .then((res) => {
        const form = res.data;
        const columnsToPick = [
          "anonymous",
          "status",
          "taskVariable",
          "tags",
          "components",
          "processKey",
          "processName",
        ];
        const data = _.pick(formProcessList, columnsToPick);
        data.parentFormId = form._id;
        data.formId = form._id;
        data.formName = form.title;
        data.status = data.status || INACTIVE;
        data.formType = form.type;
        data.formRevisionNumber = "V1";
        data.formTypeChanged = true;
        data.titleChanged = true;
        data.anonymousChanged = true;

        createMapper(data, form, redirecUrl);
      })
      .catch((err) => {
        setFormError(err);
      })
      .finally(() => {
        this.setState({ ...this.state, newpublishClicked: false });
      });
  }

  gotoEdit(redirecUrl) {
    this.props.gotoEdit(redirecUrl);
  }

  render() {
    const {
      hideComponents,
      onSubmit,
      options,
      errors,
      form: { form, isActive: isFormActive },
      handleNext,
      tenants,
      formRestore,
    } = this.props;
    const tenantKey = tenants?.tenantId;
    const redirecUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
    if (isFormActive) {
      return <Loading />;
    }
    return (
      <div className="container">
        <div className=" d-flex justify-content-between align-items-center  ">
          <h3 className="task-head">
            {" "}
            <i className="fa fa-wpforms" aria-hidden="true" /> &nbsp;{" "}
            {form.title}
          </h3>

          <div>
            <button
              className="btn btn-primary"
              onClick={() => {
                this.gotoEdit(`${redirecUrl}formflow/${form._id}/edit`);
              }}
            >
              <i className="fa fa-pencil" aria-hidden="true" />
              &nbsp;&nbsp;<Translation>{(t) => t("Edit Form")}</Translation>
            </button>
            <button
              className="btn btn-outline-secondary ml-2 "
              onClick={() => {
                this.handleModalChange();
              }}
            >
              <i className="fa fa-rotate-left  " aria-hidden="true" />
              &nbsp;&nbsp;<Translation>{(t) => t("Form History")}</Translation>
            </button>
            <button
              className="btn btn-outline-primary ml-2"
              disabled={this.state.newpublishClicked}
              onClick={() => {
                this.publishConfirmModalChange();
              }}
            >
              <i className="fa fa-clone" aria-hidden="true"></i>
              &nbsp;&nbsp;
              <Translation>{(t) => t("Duplicate Form")}</Translation>
            </button>
            <Button
              variant="contained"
              onClick={handleNext}
              className="ml-3 btn btn-primary  "
            >
              {
                (this.state.activeStep === 1,
                (<Translation>{(t) => t("Next")}</Translation>))
              }
            </Button>
          </div>
        </div>

        <CreateTemplateConfirmModal modalOpen={this.state.confirmPublisModal}
        handleModalChange={()=>{this.publishConfirmModalChange();}}
        onConfirm = {()=>{this.handlePublishAsNewVersion(redirecUrl);}}
        />
        
        <FormHistoryModal historyModal={this.state.historyModal}
        formHistory={formRestore.formHistory || []}
         handleModalChange={()=>{this.handleModalChange();}}
         gotoEdit={()=>{this.gotoEdit(`${redirecUrl}formflow/${form._id}/edit`);}}
         />

        <Errors errors={errors} />
        <LoadingOverlay
          active={this.state.newpublishClicked}
          spinner
          text={t("Loading...")}
        >
          <Form
            form={form}
            hideComponents={hideComponents}
            onSubmit={onSubmit}
            options={{ ...options, i18n: formio_resourceBundles }}
          />
        </LoadingOverlay>
      </div>
    );
  }
};

const mapStateToProps = (state) => {
  return {
    form: selectRoot("form", state),
    options: {
      readOnly: true,
      language: state.user.lang,
    },
    errors: [selectError("form", state)],
    tenants: selectRoot("tenants", state),
    formRestore: selectRoot("formRestore", state),
    user: selectRoot("user", state),
    processData: selectRoot("process", state),
  };
};

// eslint-disable-next-line no-unused-vars
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    gotoEdit: (redirecUrl) => {
      dispatch(push(redirecUrl));
    },
    clearFormHistories: () => {
      dispatch(setFormHistories([]));
    },
    createMapper: (data, form, redirectUrl) => {
      Formio.cache = {};
      dispatch(setFormSuccessData("form", form));
      dispatch(
        // eslint-disable-next-line no-unused-vars
        saveFormProcessMapperPost(data, (err, res) => {
          if (!err) {
            toast.success(t("New form published successfully"));
            dispatch(push(`${redirectUrl}formflow/${form._id}/view-edit/`));
          } else {
            toast.error(t("Error in creating form process mapper"));
          }
        })
      );
    },
    setFormError: (err) => {
      let error;
      if (err.response?.data) {
        error = err.response.data;
      } else {
        error = err.message;
      }
      dispatch(setFormFailureErrorData("form", error));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Preview);
