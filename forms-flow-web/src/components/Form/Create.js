import React, { useState, useEffect, useReducer } from "react";
import { saveForm, FormBuilder, Errors } from "react-formio";
import _set from "lodash/set";
import _cloneDeep from "lodash/cloneDeep";
import _camelCase from "lodash/camelCase";
import { push } from "connected-react-router";
import {
  SUBMISSION_ACCESS,
  ANONYMOUS_ID,
  FORM_ACCESS,
} from "../../constants/constants";
import { addHiddenApplicationComponent } from "../../constants/applicationComponent";
import { saveFormProcessMapper } from "../../apiManager/services/processServices";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

// reducer from react-formio code
const reducer = (form, { type, value }) => {
  const formCopy = _cloneDeep(form);
  switch (type) {
    case "formChange":
      for (let prop in value) {
        if (value.hasOwnProperty(prop)) {
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

const Create = React.memo((props) => {
  const dispatch = useDispatch();
  const [anonymous, setAnonymous] = useState(false);
  const formData = { display: "form" };
  const [form, dispatchFormAction] = useReducer(reducer, _cloneDeep(formData));
  const saveText = "Save & Preview";
  const errors = useSelector((state) => state.form.error);

  // for update form access and submission access
  useEffect(() => {
    FORM_ACCESS.forEach((role) => {
      if (anonymous) {
        role.roles.push(ANONYMOUS_ID);
      } else {
        role.roles = role.roles.filter((id) => id !== ANONYMOUS_ID);
      }
    });
    SUBMISSION_ACCESS.forEach((access) => {
      if (anonymous) {
        if (access.type === "create_own") {
          access.roles.push(ANONYMOUS_ID);
        }
      } else {
        if (access.type === "create_own") {
          access.roles = access.roles.filter((id) => id !== ANONYMOUS_ID);
        }
      }
    });
  }, [anonymous]);

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
    const newFormData = addHiddenApplicationComponent(form);
    const newForm = {
      ...newFormData,
      tags: ["common"],
    };
    newForm.submissionAccess = SUBMISSION_ACCESS;
    newForm.access = FORM_ACCESS;
    dispatch(
      saveForm("form", newForm, (err, form) => {
        if (!err) {
          // ownProps.setPreviewMode(true);
          const data = {
            formId: form._id,
            formName: form.title,
            formRevisionNumber: "V1", // to do
            anonymous: FORM_ACCESS[0].roles.includes(ANONYMOUS_ID),
          };
          const update = false;
          dispatch(
            saveFormProcessMapper(data, update, (err, res) => {
              if (!err) {
                toast.success("Form Saved");
                dispatch(push(`/formflow/${form._id}/view-edit/`));
              } else {
                toast.error("Error in creating form process mapper");
              }
            })
          );
        }
      })
    );
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
      <h2>Create Form</h2>
      <hr />
      <Errors errors={errors} />
      <div>
        <div className="row justify-content-end w-100">
          <div id="save-buttons" className=" save-buttons pull-right">
            <div className="form-group pull-right">
              <span className="btn btn-primary" onClick={() => saveFormData()}>
                {saveText}
              </span>
            </div>
          </div>
        </div>
        <div className="row align-item-center">
          <div className="col-lg-4 col-md-4 col-sm-4">
            <div id="form-group-title" className="form-group">
              <label htmlFor="title" className="control-label field-required">
                Title
              </label>
              <input
                type="text"
                className="form-control"
                id="title"
                placeholder="Enter the form title"
                value={form.title || ""}
                onChange={(event) => handleChange("title", event)}
              />
            </div>
          </div>
          <div className="col-lg-4 col-md-4 col-sm-4">
            <div id="form-group-name" className="form-group">
              <label htmlFor="name" className="control-label field-required">
                Name
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                placeholder="Enter the form machine name"
                value={form.name || ""}
                onChange={(event) => handleChange("name", event)}
              />
            </div>
          </div>
          <div className="col-lg-4 col-md-3 col-sm-3">
            <div id="form-group-display" className="form-group">
              <label htmlFor="name" className="control-label">
                Display as
              </label>
              <div className="input-group">
                <select
                  className="form-control"
                  name="form-display"
                  id="form-display"
                  value={form.display || ""}
                  onChange={(event) => handleChange("display", event)}
                >
                  <option label="Form" value="form">
                    Form
                  </option>
                  <option label="Wizard" value="wizard">
                    Wizard
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-3 col-sm-3">
            <div id="form-group-type" className="form-group">
              <label htmlFor="form-type" className="control-label">
                Type
              </label>
              <div className="input-group">
                <select
                  className="form-control"
                  name="form-type"
                  id="form-type"
                  value={form.type}
                  onChange={(event) => handleChange("type", event)}
                >
                  <option label="Form" value="form">
                    Form
                  </option>
                  <option label="Resource" value="resource">
                    Resource
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-4 col-sm-4">
            <div id="form-group-path" className="form-group">
              <label htmlFor="path" className="control-label field-required">
                Path
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  id="path"
                  placeholder="Enter pathname"
                  style={{ textTransform: "lowercase", width: "120px" }}
                  value={form.path || ""}
                  onChange={(event) => handleChange("path", event)}
                />
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-4 col-sm-4">
            <div
              id="form-group-anonymous"
              className="form-group"
              style={{ marginTop: "30px" }}
            >
              <div className="input-group align-items-center">
                <input
                  className="m-0"
                  style={{ height: "20px", width: "20px" }}
                  type="checkbox"
                  id="anonymous"
                  data-testid="anonymous"
                  checked={anonymous}
                  onChange={(e) => {
                    setAnonymous(!anonymous);
                  }}
                />
                <label
                  htmlFor="anonymousLabel"
                  className="form-control border-0"
                >
                  Make this form public ?
                </label>
              </div>
            </div>
          </div>
        </div>
        <FormBuilder form={form} onChange={formChange} />
      </div>
    </div>
  );
});

export default Create;
