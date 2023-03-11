import React, { useEffect } from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Errors } from "react-formio";
import _camelCase from "lodash/camelCase";
import { formCreate } from "../../../apiManager/services/FormServices";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import { addTenantkey } from "../../../helper/helper";
import FormSelect from "./FormSelect";
import Rule from "./Rule";
import { BUNDLE_CREATE_ROUTE } from "../constant/stepperConstant";
import { push } from "connected-react-router";
import {
  clearFormError,
  setFormFailureErrorData,
} from "../../../actions/formActions";
import { bundleCreate, bundleUpdate } from "../../../apiManager/services/bundleServices";
import { saveFormProcessMapperPost } from "../../../apiManager/services/processServices";

const BundleCreate = ({ mode }) => {
  const dispatch = useDispatch();
  const bundleData = useSelector((state) => state.process.formProcessList);
  const [bundleName, setBundleName] = useState(bundleData.formName || "");
  const [bundleDescription, setBundleDescription] = useState(
    bundleData.description || ""
  );
  const submissionAccess = useSelector(
    (state) => state.user?.submissionAccess || []
  );
  const formAccess = useSelector((state) => state.user?.formAccess || []);
  const tenantKey = useSelector((state) => state.tenants?.tenantId); 
  const buttonText =
    (mode && mode !== BUNDLE_CREATE_ROUTE) ? "save bundle" : "save & preview";
  const errors = useSelector((state) => state.form.error);
  const selectedForms = useSelector(
    (state) => state.bundle.selectedForms || []
  );
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";

  useEffect(() => {
    dispatch(clearFormError("form"));
  }, [dispatch]);

  const createBundle = () => {
    const newForm = {
      tags: ["common"],
      title: bundleName,
      path: _camelCase(bundleName).toLowerCase(),
      name: _camelCase(bundleName),
      type: "form",
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

    formCreate(newForm)
      .then((res) => {
        const form = res.data;
        const data = {
          formId: form._id,
          parentFormId: form._id,
          formName: form.title,
          description: bundleDescription,
          formType: "bundle",
        };
        dispatch(
          // eslint-disable-next-line no-unused-vars
          saveFormProcessMapperPost(data, (err, mapperData) => {
            if (err) {
              console.error(err);
            } else {
              const forms = selectedForms.map((i, index) => {
                return { ...i, formOrder: index + 1 };
              });
              bundleCreate({ selectedForms: forms }, mapperData.id).then(() => {
                console.log("hiiii");
                dispatch(
                  push(`${redirectUrl}bundleflow/${form._id}/view-edit`)
                );
              });
            }
          })
        );
      })
      .catch((err) => {
        const error = err.response.data || err.message;
        dispatch(setFormFailureErrorData("form", error));
      });
  };

  const updateBundle = () => {
    if (
      bundleData.formName !== bundleName ||
      bundleData.description !== bundleDescription
    ) {
      dispatch(
        saveFormProcessMapperPost({
          ...bundleData,
          formName: bundleName,
          description: bundleDescription,
        })
      );
    }
    const forms = selectedForms.map((i, index) => {
      return { ...i, formOrder: index + 1 };
    });
    bundleUpdate({ selectedForms: forms }, bundleData.id).then(() => {
      dispatch(push(`${redirectUrl}bundleflow/${bundleData.formId}/view-edit`));
    });
  };
  return (
    <div>
      <Errors errors={errors} />
      <div className="d-flex justify-content-between align-items-center">
        <h3>Create Bundle</h3>
        <button
          className="btn btn-primary"
          onClick={() => {
            mode !== BUNDLE_CREATE_ROUTE ? createBundle() : updateBundle();
          }}
        >
          {buttonText}
        </button>
      </div>
      <section>
        <div className="mt-2 align-items-center">
          <div className="m-3">
            <label>Bundle Name</label>
            <input
              value={bundleName}
              onChange={(e) => {
                setBundleName(e.target.value);
              }}
              type="text"
              className="form-control"
              placeholder="Enter name"
            />
          </div>
          <div className="m-3">
            <label>Bundle Description</label>
            <textarea
              value={bundleDescription}
              onChange={(e) => {
                setBundleDescription(e.target.value);
              }}
              type="text"
              className="form-control"
              placeholder="Enter Description"
            />
          </div>
        </div>
      </section>
      <section>
        <div className="m-3">
          <label>Select Forms</label>
          <FormSelect />
        </div>
        <div className="m-3">
          <label>Create Rules</label>
          <Rule />
        </div>
      </section>
    </div>
  );
};

export default BundleCreate;
