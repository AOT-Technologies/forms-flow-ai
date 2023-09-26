import React, { useState, useEffect, useReducer } from "react";
import { Errors, FormBuilder, Formio } from "react-formio";
import { push } from "connected-react-router";
import { useHistory } from "react-router-dom";
import _set from "lodash/set";
import _cloneDeep from "lodash/cloneDeep";
import _camelCase from "lodash/camelCase";
import _isEquial from "lodash/isEqual";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import { INACTIVE } from "../constants/formListConstants";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { setFormProcessesData } from "../../../actions/processActions";
import { Translation, useTranslation } from "react-i18next";
import utils from "formiojs/utils";
import {
  deleteFormProcessMapper,
  saveFormProcessMapperPost,
  saveFormProcessMapperPut,
} from "../../../apiManager/services/processServices";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { formio_resourceBundles } from "../../../resourceBundles/formio_resourceBundles";
import {
  clearFormError,
  setFormFailureErrorData,
  setFormHistories,
  setFormSuccessData,
  setRestoreFormData,
  setRestoreFormId,
} from "../../../actions/formActions";
import { removeTenantKey } from "../../../helper/helper";
import { fetchFormById } from "../../../apiManager/services/bpmFormServices";
import {
  formCreate,
  formUpdate,
  getFormHistory,
} from "../../../apiManager/services/FormServices";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import { manipulatingFormData } from "../../../apiManager/services/formFormatterService";
import SaveAsNewVersionConfirmationModal from "./SaveAsNewVersionConfirmationModal";
import LoadingOverlay from "react-loading-overlay";
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
  const processListData = useSelector((state) => state.process?.formProcessList);
  const formData = useSelector((state) => state.form?.form );
  const [form, dispatchFormAction] = useReducer(reducer, _cloneDeep(formData));
  const errors = useSelector((state) => state.form?.error);
  const formHistory = useSelector((state) => state.formRestore?.formHistory || []);
  const version = formHistory[0]?.changeLog?.version;
  const prviousData = useSelector((state) => state.process?.formPreviousData);
  const applicationCount = useSelector(
    (state) => state.process?.applicationCount
  );
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const restoredFormId = useSelector(
    (state) => state.formRestore?.restoredFormId
  );
  const restoredFormData = useSelector(
    (state) => state.formRestore?.restoredFormData
  );
  const formAccess = useSelector((state) => state.user?.formAccess || []);
  const roleIds = useSelector((state) => state.user?.roleIds || {});
  const submissionAccess = useSelector(
    (state) => state.user?.submissionAccess || []
  );
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const saveText = <Translation>{(t) => t("Save Form")}</Translation>;
  const saveNewVersion = <Translation>{(t) => t("Save New Version")}</Translation>;
  const [formSubmitted, setFormSubmitted] = useState(false);

  const lang = useSelector((state) => state.user.lang);
  const history = useHistory();
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [currentFormLoading, setCurrentFormLoading] = useState(false);
  const [saveAsNewVersionselected, setSaveAsNewVersion] = useState(false);
  const [confirmModalShow, setConfirmModalShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleConfirmModalChange = () => setConfirmModalShow(!confirmModalShow);

  const handleSave = () => {
    setShow(false);
    saveFormData();
  };

  useEffect(()=>{
    if(processListData?.parentFormId && !formHistory.length){
       getFormHistory(processListData?.parentFormId).then((res)=>{
      dispatch(setFormHistories(res.data));
    }).catch(()=>{
      setFormHistories([]);
    });
  }
  },[processListData]);

  useEffect(() => {
    if (restoredFormId) {
      setCurrentFormLoading(true);
      fetchFormById(restoredFormId)
        .then((res) => {
          if (res.data) {
            const { data } = res;
            dispatch(setRestoreFormData(res.data));
            dispatchFormAction({
              type: "components",
              value: _cloneDeep(data.components),
            });
            dispatchFormAction({ type: "type", value: data.type });
            dispatchFormAction({ type: "display", value: data.display });
          }
        })
        .catch((err) => {
          toast.error(err.response.data);
        })
        .finally(() => {
          setCurrentFormLoading(false);
        });
    }
    return () => {
      dispatch(setRestoreFormData({}));
      dispatch(setRestoreFormId(null));
    };
  }, [restoredFormId]);

  //remove tenatkey form path name
  useEffect(() => {
    if (form?.path && MULTITENANCY_ENABLED) {
      const newPath = removeTenantKey(form.path, tenantKey);
      if (newPath) {
        dispatchFormAction({ type: "path", value: newPath });
      }
    }
  }, [form?.path]);
  // remove tenant key from form name
  useEffect(() => {
    if (form?.name && MULTITENANCY_ENABLED) {
      const newName = removeTenantKey(form.name, tenantKey);
      if (newName) {
        dispatchFormAction({ type: "name", value: newName });
      }
    }
  }, [form?.name]);

  // setting the form data
  useEffect(() => {
    const newForm = formData;
    if (
      newForm &&
      (form._id !== newForm._id || form.modified !== newForm.modified)
    ) {
      dispatchFormAction({ type: "replaceForm", value: newForm });
    }
  }, [formData, form]);

  // set the anonymous value
  const changeAnonymous = (setvalue, goBack) => {
    let latestValue = goBack ? setvalue : !processListData.anonymous;
    let newData = {
      ...processListData,
      anonymous: latestValue,
    };
    dispatch(setFormProcessesData(newData));
  };

  //  chaning the form access
  useEffect(() => {
    formAccess.forEach((role) => {
      if (processListData.anonymous) {
        if (role.type === "read_all") {
          role.roles.push(roleIds.ANONYMOUS);
        }
      } else {
        if (role.type === "read_all") {
          role.roles = role.roles.filter((id) => id !== roleIds.ANONYMOUS);
        }
      }
    });

    submissionAccess.forEach((access) => {
      if (processListData.anonymous) {
        if (access.type === "create_own") {
          access.roles.push(roleIds.ANONYMOUS);
        }
      } else {
        if (access.type === "create_own") {
          access.roles = access.roles.filter((id) => id !== roleIds.ANONYMOUS);
        }
      }
    });
  }, [processListData]);

  const isNewMapperNeeded = () => {
    return prviousData.formName !== form.title && applicationCount > 0;
  };

  const handleChooseOption = () => {
    if (saveAsNewVersionselected) {
      setConfirmModalShow(true);
    } else {
      saveFormWithDataChangeCheck();
    }
  };

  const saveAsNewVersionOnCofirm = () => {
    setConfirmModalShow(false);
    saveAsNewVersion();
  };

  const saveFormWithDataChangeCheck = () => {
    if (isNewMapperNeeded()) {
      handleShow();
    } else {
      saveFormData();
    }
  };

  const isMapperSaveNeeded = (newData) => {
    // checks if the updates need to save to form_process_mapper too
    return (
      prviousData.formName !== newData.title ||
      prviousData.anonymous !== processListData.anonymous ||
      processListData.anonymous === null ||
      processListData.formType !== newData.type
    );
  };
  // to check the component changed or not
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
      formTypeChanged: prviousData.formType !== submittedData.type,
      titleChanged: prviousData.formName !== submittedData.title,
      anonymousChanged: prviousData.anonymous !== processListData.anonymous,
    };
    return data;
  };

  const saveAsNewVersion = async () => {
    setFormSubmitted(true);
    const newFormData = manipulatingFormData(
      form,
      MULTITENANCY_ENABLED,
      tenantKey,
      formAccess,
      submissionAccess
    );
    const oldFormData = manipulatingFormData(
      formData,
      MULTITENANCY_ENABLED,
      tenantKey,
      formAccess,
      submissionAccess
    );

    const newPathAndName = "-v" + Math.random().toString(16).slice(9);
    oldFormData.path += newPathAndName;
    oldFormData.name += newPathAndName;
    await formUpdate(oldFormData._id, oldFormData);
    const previousformId = newFormData._id;
    newFormData.componentChanged = true;
    newFormData.newVersion = true;
    newFormData.parentFormId = prviousData.parentFormId;
    delete newFormData.machineName;
    delete newFormData._id;
    formCreate(newFormData)
      .then((res) => {
        const { data: submittedData } = res;
        const data = setFormProcessDataToVariable(submittedData);
        data.formRevisionNumber = "V1";
        data["version"] = String(+prviousData.version + 1);
        data["processKey"] = prviousData.processKey;
        data["processName"] = prviousData.processName;
        data.previousFormId = previousformId;
        data.parentFormId = prviousData.parentFormId;
        Formio.cache = {};
        const prviousId = prviousData.id;
        dispatch(saveFormProcessMapperPost(data, (err) => {
          if (!err) {
            dispatch(deleteFormProcessMapper(prviousId));
            dispatch(setFormSuccessData("form", submittedData));
            dispatch(setRestoreFormData({}));
            dispatch(setRestoreFormId(null));
            toast.success(t("New version created"));
            dispatch(push(`${redirectUrl}formflow/${submittedData._id}/preview`));
          }
        }));
      })
      .catch((err) => {
        const error = err.response.data || err.message;
        dispatch(setFormFailureErrorData("form", error));
      })
      .finally(() => {
        setFormSubmitted(false);
      });
  };

  // save form data to submit
  const saveFormData = () => {
    setFormSubmitted(true);
    const newFormData = manipulatingFormData(
      form,
      MULTITENANCY_ENABLED,
      tenantKey,
      formAccess,
      submissionAccess
    );
    newFormData.componentChanged = isFormComponentsChanged();
    newFormData.parentFormId = prviousData.parentFormId;

    formUpdate(newFormData._id, newFormData)
      .then((res) => {
        const { data: submittedData } = res;
        if (isMapperSaveNeeded(submittedData)) {
          const data = setFormProcessDataToVariable(submittedData);

          // PUT request : when application count is zero.
          // POST request with updated version : when application count is positive.

          if (isNewMapperNeeded()) {
            data["version"] = String(+prviousData.version + 1);
            data["processKey"] = prviousData.processKey;
            data["processName"] = prviousData.processName;
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
        toast.success(t("Form Saved"));
        dispatch(setFormSuccessData("form", submittedData));
        Formio.cache = {};
        dispatch(push(`${redirectUrl}formflow/${submittedData._id}/preview`));
      })
      .catch((err) => {
        const error = err.response?.data || err.message;
        dispatch(setFormFailureErrorData("form", error));
      })
      .finally(() => {
        setFormSubmitted(false);
      });
  };

  // information about tenant key adding

  const addingTenantKeyInformation = (type) => {
    if (MULTITENANCY_ENABLED) {
      return (
        <span className="ml-1">
          <i
            className="fa fa-info-circle text-primary cursor-pointer"
            data-toggle="tooltip"
            title={`${t(
              "By default, the tenant key would be prefixed to form"
            )}${type}`}
          ></i>
        </span>
      );
    }
  };

  // setting the main option details to the formdata
  const handleChange = (path, event) => {
    const { target } = event;
    const value = target.type === "checkbox" ? target.checked : target.value;

    dispatchFormAction({ type: path, value });
  };

  const formChange = (newForm) =>
    dispatchFormAction({ type: "formChange", value: newForm });

  // loading up to set the data to the form variable
  if (!form?._id || currentFormLoading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-grow" role="status">
          <span className="sr-only">
            {t("Loading...")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {
        saveAsNewVersionselected && confirmModalShow && (
          <SaveAsNewVersionConfirmationModal modalOpen={confirmModalShow}
            handleModalChange={handleConfirmModalChange}
            onConfirm={saveAsNewVersionOnCofirm} />
        )
      }
      <div className="d-flex align-items-center flex-wrap justify-content-between my-4 bg-light p-3">   
        <div style={{maxWidth:"60%",wordBreak:"break-word" }}>
          <h3 className="ml-3 task-head">
            <i className="fa fa-wpforms" aria-hidden="true" /> &nbsp;{" "}
            {formData.title}
            <span className="text-success h5 ml-2">(Version {version})</span>
          </h3>
        </div>  
        <div className="d-flex align-items-center">
          <FormControlLabel
            className="mr-2"
            control={
              <Checkbox
                checked={saveAsNewVersionselected}
                color="primary"
                aria-label="Publish"
                onChange={(e) => {
                  setSaveAsNewVersion(e.target.checked);
                }}
              />
            }
            label={t("Do you want to save a new version of this form?")}
            labelPlacement="start"
          />
          <span
            className="btn btn-secondary mr-2"
            onClick={() => {
              changeAnonymous(prviousData.anonymous, true);
              history.goBack();
              dispatch(clearFormError("form", formData.formName));
            }}
          >
            {t("Cancel")}
          </span>
          <button
            className="btn btn-primary"
            disabled={formSubmitted}
            onClick={() => {
              handleChooseOption();

            }}
          >
            {saveAsNewVersionselected ? saveNewVersion : saveText}
          </button>
        </div>
      </div>



      <Errors errors={errors} />
      <div
        className="p-4"
        style={{ border: "1px solid #c2c0be", borderRadius: "5px" }}
      >
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{t("Confirmation")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {t(
              "Changing the form title will not affect the existing applications. " +
              "It will only update in the newly created applications. Press Save " +
              "Changes to continue or cancel the changes."
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              {t("Cancel")}
            </Button>
            <Button variant="primary" onClick={() => handleSave()}>
              {t("Save Changes")}
            </Button>
          </Modal.Footer>
        </Modal>
        <LoadingOverlay
          active={formSubmitted}
          spinner
          text={t("Loading...")}
        >
          <div className="row">
            <div className="col-lg-4 col-md-4 col-sm-4">
              <div id="form-group-title" className="form-group">
                <label htmlFor="title" className="control-label field-required">
                  {t("Title")}
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  placeholder={t("Enter the form title")}
                  value={form.title || ""}
                  onChange={(event) => handleChange("title", event)}
                />
              </div>
            </div>
            <div className="col-lg-4 col-md-4 col-sm-4">
              <div id="form-group-name" className="form-group">
                <label htmlFor="name" className="control-label field-required">
                 {t("Name")}
                  {addingTenantKeyInformation("name")}
                </label>
                <div className="input-group mb-2">
                  {MULTITENANCY_ENABLED && tenantKey ? (
                    <div className="input-group-prepend">
                      <div
                        className="input-group-text"
                        style={{ maxWidth: "150px" }}
                      >
                        <span className="text-truncate">{tenantKey}</span>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    placeholder={t("Enter the form machine name")}
                    value={form?.name || ""}
                    onChange={(event) => handleChange("name", event)}
                  />
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-3 col-sm-3">
              <div id="form-group-display" className="form-group">
                <label htmlFor="name" className="control-label">
                  {t("Display as")}
                </label>
                <div className="input-group">
                  <select
                    className="form-control"
                    name="form-display"
                    id="form-display"
                    value={form.display || ""}
                    onChange={(event) => handleChange("display", event)}
                  >
                    <option label={t("Form")} value="form">
                      {t("Form")}
                    </option>
                    <option label={t("Wizard")} value="wizard">
                     {t("Wizard")}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-3 col-sm-3">
              <div id="form-group-type" className="form-group">
                <label htmlFor="form-type" className="control-label">
                  {t("Type")}
                </label>
                <div className="input-group">
                  <select
                    className="form-control"
                    name="form-type"
                    id="form-type"
                    value={form.type}
                    onChange={(event) => handleChange("type", event)}
                  >
                    <option label={t("Form")} value="form">
                     {t("Form")}
                    </option>
                    <option label={t("Resource")} value="resource">
                      {t("Resource")}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-4 col-sm-4">
              <div id="form-group-path" className="form-group">
                <label htmlFor="path" className="control-label field-required">
                  {t("Path")}
                  {addingTenantKeyInformation("path")}
                </label>
                <div className="input-group mb-2">
                  {MULTITENANCY_ENABLED && tenantKey ? (
                    <div className="input-group-prepend">
                      <div
                        className="input-group-text"
                        style={{ maxWidth: "150px" }}
                      >
                        <span className="text-truncate">{tenantKey}</span>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  <input
                    type="text"
                    className="form-control"
                    id="path"
                    placeholder="example"
                    style={{ textTransform: "lowercase", width: "120px" }}
                    value={form?.path || ""}
                    onChange={(event) => handleChange("path", event)}
                  />
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-4 col-sm-4">
              <div id="form-group-path" className="form-group">
                <label htmlFor="path" className="control-label "></label>
                <div className="input-group">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={processListData.anonymous || false}
                        color="primary"
                        aria-label="Publish"
                        onChange={() => {
                          changeAnonymous();
                        }}
                      />
                    }
                    label={t("Make this form public ?")}
                    labelPlacement="start"
                  />
                </div>
              </div>
            </div>
          </div>
          <FormBuilder
            key={form._id}
            form={form}
            onChange={formChange}
            options={{
              language: lang,
              i18n: formio_resourceBundles,
              builder: {
                custom: {
                    title: 'Custom',
                    weight: 10,
                    }
                 }
            }}
          />
        </LoadingOverlay>
      </div>
    </div>
  );
});
export default Edit;
