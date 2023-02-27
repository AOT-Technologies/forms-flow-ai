import React, { useEffect } from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {Errors} from "react-formio";
import _camelCase from "lodash/camelCase";
import { formCreate } from "../../../apiManager/services/FormServices";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import { addTenantkey } from "../../../helper/helper";
import FormSelect from "./FormSelect";
import Rule from "./Rule";
import { STEPPER_ROUTE } from "../constant/stepperConstant";
import { push } from "connected-react-router";
import { clearFormError, setFormFailureErrorData } from "../../../actions/formActions";

const BundleCreate = ({mode}) => {
  const dispatch = useDispatch();
  const [bundleName, setBundleName] = useState('');
  const params = useParams();
  const [bundleDescription, setBundleDescription] = useState('');
  const submissionAccess = useSelector((state) => state.user?.submissionAccess || []) ;
  const formAccess = useSelector((state) => state.user?.formAccess || []) ;
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const roleIds = useSelector((state) => state.user?.roleIds || {}) ;
  const buttonText = mode === STEPPER_ROUTE[0] ? "save bundle" : "save & preview";
  const errors = useSelector((state) => state.form.error);

  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  useEffect(()=>{
    if(params.formId && mode ===  STEPPER_ROUTE[0]){
      console.log(mode);
    }
  },[mode]);

  useEffect(() => {
    dispatch(clearFormError("form"));
  }, [dispatch]);

  const createBundle = ()=>{
    const newForm = {
      tags: ["common"],
      title:bundleName,
      path:_camelCase(bundleName).toLowerCase(),
      name:_camelCase(bundleName),
      type:"form"
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
    formCreate(newForm).then((res)=>{
      const form = res.data;
      const data = {
        formId: form._id,
        formName: form.title,
        formType: form.type,
        formTypeChanged:true, 
        anonymousChanged:true,
        parentFormId: form._id,
        titleChanged: true,
        isBundle:true,
        bundleDescription:bundleDescription,
        formRevisionNumber: "V1", // to do
        anonymous: formAccess[0]?.roles.includes(roleIds.ANONYMOUS),
      };
      console.log(data);
      dispatch(push(`${redirectUrl}bundleflow/${form._id}/view-edit`));
    }).catch((err)=>{
      const error = err.response.data || err.message;
      dispatch(setFormFailureErrorData("form", error));
    });
  };
 
  return (
    <div>
        <Errors errors={errors} />
      <div className="d-flex justify-content-between align-items-center">
        <h3>Create Bundle</h3>
        <button className="btn btn-primary" onClick={()=>{createBundle();}} >
          {buttonText}
        </button>
      </div>
      <section>
        <div className="mt-2 align-items-center">
          <div className="m-3">
            <label>Bundle Name</label>
            <input
              onChange={(e)=>{setBundleName(e.target.value);}}
              type="text"
              className="form-control"
              placeholder="Enter name"
            />
          </div>
          <div className="m-3">
            <label>Bundle Description</label>
            <textarea
              onChange={(e)=>{setBundleDescription(e.target.value);}}
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
          <FormSelect/>
        </div>
        <div className="m-3">
        <label>Create Rules</label>
          <Rule/>
        </div>
      </section>
    </div>
  );
};

export default BundleCreate;
