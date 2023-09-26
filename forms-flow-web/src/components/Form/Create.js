import React, { useState, useEffect, useReducer } from "react";
import { FormBuilder, Errors } from "react-formio";
import _set from "lodash/set";
import _cloneDeep from "lodash/cloneDeep";
import _camelCase from "lodash/camelCase";
import { push } from "connected-react-router";
import {
  MULTITENANCY_ENABLED,
} from "../../constants/constants";
import { addHiddenApplicationComponent } from "../../constants/applicationComponent";
import { saveFormProcessMapperPost } from "../../apiManager/services/processServices";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation, Translation } from "react-i18next";
import { formio_resourceBundles } from "../../resourceBundles/formio_resourceBundles";
import {
  clearFormError,
  setFormFailureErrorData,
  setFormSuccessData,
} from "../../actions/formActions";
import { addTenantkey } from "../../helper/helper";
import { formCreate } from "../../apiManager/services/FormServices";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import { handleAuthorization } from "../../apiManager/services/authorizationService";
// reducer from react-formio code
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

const Create = React.memo(() => {
  const dispatch = useDispatch();
  const [anonymous, setAnonymous] = useState(false);
  const formData = { display: "form" };
  const [form, dispatchFormAction] = useReducer(reducer, _cloneDeep(formData));
  const saveText = <Translation>{(t) => t("Save & Preview")}</Translation>;
  const errors = useSelector((state) => state.form?.error);
  const lang = useSelector((state) => state.user.lang);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const formAccess = useSelector((state) => state.user?.formAccess || []);
  const roleIds = useSelector((state) => state.user?.roleIds || {});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const submissionAccess = useSelector((state) => state.user?.submissionAccess || []);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";

  const { t } = useTranslation();
  useEffect(() => {
    dispatch(clearFormError("form"));
  }, [dispatch]);

  // for update form access and submission access
  useEffect(() => {
    formAccess.forEach((role) => {
      if (anonymous) {
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
      if (anonymous) {
        if (access.type === "create_own") {
          access.roles.push(roleIds.ANONYMOUS);
        }
      } else {
        if (access.type === "create_own") {
          access.roles = access.roles.filter((id) => id !== roleIds.ANONYMOUS);
        }
      }
    });
  }, [anonymous]);

  // information about tenant key adding

  const addingTenantKeyInformation = (type) => {
    if (MULTITENANCY_ENABLED) {
      return (
        <span className="ml-1">
          <i
            className="fa fa-info-circle text-primary cursor-pointer"
            data-toggle="tooltip"
            title={`${t("By default, the tenant key would be prefixed to form")}${type}`}
          ></i>
        </span>
      );
    }
  };



  // setting the form data
  useEffect(() => {
    const newForm = { display: "form" };
    if (
      newForm &&
      (form._id !== newForm._id || form.modified !== newForm.modified)
    ) {
      dispatchFormAction({ type: "replaceForm", value: newForm });
    }
  }, [form]);

  // submitting form
  const saveFormData = () => {
    setFormSubmitted(true);
    const newFormData = addHiddenApplicationComponent(form);
    const newForm = {
      ...newFormData,
      tags: ["common"],
    };

    newForm.submissionAccess = submissionAccess;
    newForm.componentChanged = true;
    newForm.newVersion = true;
    newForm.access = formAccess;
    if (MULTITENANCY_ENABLED && tenantKey) {
      newForm.tenantKey = tenantKey;
      if (newForm.path) {
        newForm.path = addTenantkey(newForm.path, tenantKey);
      }
      if (newForm.name) {
        newForm.name = addTenantkey(newForm.name, tenantKey);
      }
    }
    formCreate(newForm).then((res) => {
      const form = res.data;
      const data = {
        formId: form._id,
        formName: form.title,
        formType: form.type,
        formTypeChanged: true,
        anonymousChanged: true,
        parentFormId: form._id,
        titleChanged: true,
        formRevisionNumber: "V1", // to do
        anonymous: formAccess[0]?.roles.includes(roleIds.ANONYMOUS),
      };
      let payload = {
        resourceId:data.formId,
        resourceDetails: {},
        roles : []
      };
      dispatch(setFormSuccessData("form", form));
      handleAuthorization(
        { application: payload, designer: payload, form: payload },
        data.formId
      ).catch((err) => {
        console.log(err);
      });
      dispatch(
        // eslint-disable-next-line no-unused-vars
        saveFormProcessMapperPost(data, (err, res) => {
          if (!err) {
            toast.success(t("Form saved"));
            dispatch(push(`${redirectUrl}formflow/${form._id}/view-edit/`));
          } else {
            setFormSubmitted(false);
            toast.error(t("Error in creating form process mapper"));
          }
        })
      );

    }).catch((err) => {
      let error;
      if (err.response?.data) {
        error = err.response.data;
      } else {
        error = err.message;
      }
      dispatch(setFormFailureErrorData("form", error));

    }).finally(() => {
      setFormSubmitted(false);
    });
  };

  // setting the main option details to the formdata
  const handleChange = (path, event) => {
    const { target } = event;
    const value = target.type === "checkbox" ? target.checked : target.value;
    dispatchFormAction({ type: path, value });
  };

  const formChange = (newForm) =>
    dispatchFormAction({ type: "formChange", value: newForm });

  return (
    <div>
      <div className="d-flex align-items-center flex-wrap justify-content-between my-4 bg-light p-3">
        <h2>
          <Translation>{(t) => t("Create Form")}</Translation>
        </h2>
        <button className="btn btn-primary" disabled={formSubmitted} onClick={() => saveFormData()}>
          {saveText}
        </button>

      </div>

      <Errors errors={errors} />
      <div className="p-4"
        style={{ border: "1px solid #c2c0be", borderRadius: "5px" }}>

        <div className="row align-item-center">
          <div className="col-lg-4 col-md-4 col-sm-4">
            <div id="form-group-title" className="form-group">
              <label htmlFor="title" className="control-label field-required">
                {" "}
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
                {
                  MULTITENANCY_ENABLED && tenantKey ? <div className="input-group-prepend">
                    <div
                      className="input-group-text"
                      style={{ maxWidth: "150px" }}
                    >
                      <span className="text-truncate">{tenantKey}</span>
                    </div>
                  </div> : ""
                }
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
                {
                  MULTITENANCY_ENABLED && tenantKey ? <div className="input-group-prepend">
                    <div
                      className="input-group-text"
                      style={{ maxWidth: "150px" }}
                    >
                      <span className="text-truncate">{tenantKey}</span>
                    </div>
                  </div> : ""
                }
                <input
                  type="text"
                  className="form-control"
                  id="path"
                  placeholder={t("Enter pathname")}
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
                      checked={anonymous}
                      id="anonymous"
                      color="primary"
                      aria-label="Publish"
                      onChange={() => {
                        setAnonymous(!anonymous);
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
      </div>
    </div>
  );
});

export default Create;
