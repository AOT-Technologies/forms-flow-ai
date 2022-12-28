import React, { PureComponent } from "react";
import { connect } from "react-redux";

import { selectRoot, Form, selectError, Errors, Formio } from "react-formio";
import { push } from "connected-react-router";
import { Button } from "react-bootstrap";
import Loading from "../../../containers/Loading";
import { Translation } from "react-i18next";
import { formio_resourceBundles } from "../../../resourceBundles/formio_resourceBundles";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import Modal from "react-bootstrap/Modal";
import {
  setFormFailureErrorData,
  setFormHistories,
  setFormSuccessData,
  setRestoreFormId,
} from "../../../actions/formActions";
import {
  formCreate,
  getFormHistory,
} from "../../../apiManager/services/FormServices";
import { getLocalDateTime } from "../../../apiManager/services/formatterService";

import _ from "lodash";
// import { INACTIVE } from "../constants/formListConstants";
import { manipulatingFormData } from "../../../apiManager/services/formFormatterService";
import { saveFormProcessMapperPost } from "../../../apiManager/services/processServices";
import { toast } from "react-toastify";
import { t } from "i18next";
import { INACTIVE } from "../constants/formListConstants";
import LoadingOverlay from "react-loading-overlay";
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
    };
  }

  componentDidMount() {
    this.props.getFormHistories(this.props.form.id);
  }
  componentWillUnmount() {
    this.props.clearFormHistories();
  }

  handleModalChange() {
    this.setState({ ...this.state, historyModal: !this.state.historyModal });
  }

  handleRestore(redirecUrl, restoreId) {
    this.props.onRestore(restoreId);
    this.props.gotoEdit(redirecUrl);
  }

  handlePublishAsNewVersion(redirecUrl) {
    this.setState({ ...this.state, newpublishClicked: true });
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
              className="btn btn-outline-primary"
              disabled={this.state.newpublishClicked}
              onClick={() => {
                this.handlePublishAsNewVersion(redirecUrl);
              }}
            >
              <i className="fa fa-refresh" aria-hidden="true"></i>
              &nbsp;&nbsp;
              <Translation>{(t) => t("Publish as new Version")}</Translation>
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
            <Button
              className="btn btn-primary   ml-2"
              onClick={() => {
                this.gotoEdit(`${redirecUrl}formflow/${form._id}/edit`);
              }}
            >
              <i className="fa fa-pencil" aria-hidden="true" />
              &nbsp;&nbsp;<Translation>{(t) => t("Edit Form")}</Translation>
            </Button>
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

        <Modal
          show={this.state.historyModal}
          size="lg"
          aria-labelledby="example-custom-modal-styling-title"
        >
          <Modal.Header>
            <div>
              <Modal.Title id="example-custom-modal-styling-title">
                Form History
              </Modal.Title>
            </div>

            <div>
              <button
                type="button"
                className="close"
                onClick={() => {
                  this.handleModalChange();
                }}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          </Modal.Header>

          <Modal.Body>
            <div className="d-flex align-items-start p-3">
              <i className="fa fa-info-circle text-primary mr-2"></i>
              <span className="text-muted h6">
                Formsflow automatically save your previous form data. Now you
                can switch to previous stage and edit.
              </span>
            </div>
            {formRestore?.formHistory.length ? (
              <ul className="form-history-container">
                {formRestore?.formHistory.map((i, index) => (
                  <li key={index}>
                    <div
                      className={`d-flex justify-content-between history-details ${
                        index === 0 ? "active" : ""
                      }`}
                    >
                      <div>
                        <span className="text-muted text-small">
                          {formRestore.formHistory.length === 1
                            ? "Created by"
                            : "Modified by"}
                        </span>
                        <span className="d-block">Peter Watts</span>
                      </div>
                      <div>
                        <span className="text-muted">
                          {formRestore.formHistory.length === 1
                            ? "Created on"
                            : "Modified on"}
                        </span>
                        <p>{getLocalDateTime(i.created)}</p>
                      </div>
                      <div>
                        <span className="d-block text-muted">Action </span>
                        <button
                          className="btn btn-outline-primary"
                          disabled={index === 0}
                          onClick={() => {
                            this.handleRestore(
                              `${redirecUrl}formflow/${form._id}/edit`,
                              i.changeLog.cloned_form_id
                            );
                          }}
                        >
                          <i className="fa fa-pencil" aria-hidden="true" />
                          &nbsp;&nbsp; Edit
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No histories found</p>
            )}
          </Modal.Body>
        </Modal>

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
    onRestore: (formId) => {
      dispatch(setRestoreFormId(formId));
    },
    gotoEdit: (redirecUrl) => {
      dispatch(push(redirecUrl));
    },
    clearFormHistories: () => {
      dispatch(setFormHistories([]));
    },
    getFormHistories: (formId) => {
      getFormHistory(formId)
        .then((res) => {
          dispatch(setFormHistories(res.data));
        })
        .catch(() => {
          dispatch(setFormHistories([]));
        });
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
