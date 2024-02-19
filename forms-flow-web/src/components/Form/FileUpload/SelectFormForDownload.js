import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFormCheckList } from "../../../actions/checkListActions";
import { useTranslation } from "react-i18next";
import Form from "react-bootstrap/Form";
const SelectFormForDownload = React.memo(({ form, type }) => {
 
  const formCheckList = useSelector((state) => state.formCheckList.formList);
  const forms = useSelector((state) => state.bpmForms.forms);
 
  const [isFormChecked, setIsFormChecked] = useState(false);
  const [isAllFormChecked, setIsAllFormChecked] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  useEffect(() => {
    if (form && formCheckList.length) {
      const isFormAdded = formCheckList.some(
        (formData) => formData._id === form._id
      );
      setIsFormChecked(isFormAdded);
    } else {
      setIsFormChecked(false);
    }
  }, [formCheckList, form]);

  useEffect(() => {
    if (formCheckList.length) {
      const idList = formCheckList.map((formData) => formData._id);
      setIsAllFormChecked(
        forms.every((formData) => idList.includes(formData._id))
      );
    } else {
      setIsAllFormChecked(false);
    }
  }, [formCheckList, forms]);

  const updateFormCheckList = (formInsert) => {
    let updatedFormCheckList = [...formCheckList];
    if (formInsert) {
      updatedFormCheckList.push(form);
    } else {
      const index = updatedFormCheckList.findIndex(
        (formData) => formData._id === form._id
      );
      updatedFormCheckList.splice(index, 1);
    }
    dispatch(setFormCheckList(updatedFormCheckList));
  };

  const addAllFormCheckList = (allFormInsert) => {
    if (!allFormInsert) {
      dispatch(setFormCheckList([]));
    } else {
      let updatedFormCheckList = [...formCheckList];
      forms.forEach((formData) => {
        const isFormAdded = formCheckList.some(
          (formCheck) => formData._id === formCheck._id
        );
        if (!isFormAdded) {
          
          updatedFormCheckList.push({ ...formData });
        }
      });
      dispatch(setFormCheckList(updatedFormCheckList));
    }
  };

  if (type === "all") {
    return (
      <div className="select_download">
       
      <Form.Check
      >
        <Form.Check.Input
          className="select_input"
          data-testid="download-all-form-checkbox"
          aria-label="Check"
          onChange={() => addAllFormCheckList(!isAllFormChecked)}
          checked={isAllFormChecked}
          title={t("Select all to download forms")}
        />
      </Form.Check>
        </div>
      
    );
  }
  return (
    <Form.Check>
      <Form.Check.Input
        className="form-check-input"        
        aria-label="option"
        data-testid={`download-form-checkbox-${form._id}`}
        checked={isFormChecked}
        onChange={() => updateFormCheckList(!isFormChecked)}
        title={t("Select for download")}
      />
    </Form.Check>
  );
});
export default SelectFormForDownload;