import React, { useState ,useEffect} from "react";
import { saveForm, FormEdit, Errors } from "react-formio";
import { push } from "connected-react-router";
import {
  SUBMISSION_ACCESS,
  ANONYMOUS_ID,
  FORM_ACCESS,
} from "../../constants/constants";
import { Translation } from "react-i18next";
import { addHiddenApplicationComponent } from "../../constants/applicationComponent";
import { saveFormProcessMapper } from "../../apiManager/services/processServices";
import { useDispatch,useSelector } from "react-redux";
import { formio_translation } from "../../translations/formiotranslation";
const Create = React.memo((props) => {
const dispatch = useDispatch()
const [anonymous, setAnonymous] = useState(false);
const form = { display: "form" }
const saveText = "Save & Preview";
const errors = useSelector((state)=>state.form.error)
// for update form access and submission access
useEffect(()=>{
  FORM_ACCESS.forEach(role=>{
    if(anonymous){
      role.roles.push(ANONYMOUS_ID)
    }else{
      role.roles = role.roles.filter(id=>id!==ANONYMOUS_ID)
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
},[anonymous])

// submitting form
const saveFormData =(formData) => {
  formData = addHiddenApplicationComponent(formData);
  const newForm = {
    ...formData,
    tags: ["common"],
  };
  newForm.submissionAccess = SUBMISSION_ACCESS; 
  newForm.access=FORM_ACCESS
  dispatch(
    saveForm("form", newForm, (err, form) => {
      if (!err) {
        // ownProps.setPreviewMode(true);
        const data = {
          formId: form._id,
          formName:form.title,
          formRevisionNumber: "V1", // to do
          anonymous:FORM_ACCESS[0].roles.includes(ANONYMOUS_ID)
        };
        const update = false
        dispatch( saveFormProcessMapper(data,update) );
        dispatch(push(`/formflow/${form._id}/view-edit/`));
      }
    })
  );
}

  return (
    <div>
      <h2><Translation>{(t)=>t("create_form")}</Translation></h2>
      <hr />
      <Errors errors={errors} />
    
      {props && (
        <div class="form-check text-right">
          <input
            class="form-check-input big-checkbox"
            type="checkbox"
            checked={anonymous}
            onChange={(e) =>{setAnonymous(!anonymous)}}
          /> 
          <label   class="pl-2 form-check-label" for="anonymousCheckBox">
          <Translation>{(t)=>t("anonymous_form")}</Translation>
           </label>
        </div>
      )}
      <FormEdit
      options={{
        language: props.lang,
        i18n: formio_translation
        }}{...props}
      form={form} saveText={saveText} saveForm={(formData)=>{saveFormData(formData)}}/>
    </div>
  );
});
 
export default Create;
