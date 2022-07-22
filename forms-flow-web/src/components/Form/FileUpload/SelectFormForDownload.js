import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFormCheckList } from "../../../actions/checkListActions";
import { getFormattedForm } from "../constants/formListConstants";
import { useTranslation } from "react-i18next";
import Form from "react-bootstrap/Form";
const SelectFormForDownload = React.memo(({ form, type }) => {
  const formCheckList = useSelector((state) => state.formCheckList.formList);
  const forms = useSelector((state) => state.forms.forms);
  const formObj = getFormattedForm(form);
  const [isFormChecked, setIsFormChecked] = useState(false);
  const [isAllFormChecked, setIsAllFormChecked] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  useEffect(() => {
    if (formObj && formCheckList.length) {
      const isFormAdded = formCheckList.some(
        (formData) => formData.path === formObj.path
      );
      setIsFormChecked(isFormAdded);
    } else {
      setIsFormChecked(false);
    }
  }, [formCheckList, formObj]);

  useEffect(() => {
    if (formCheckList.length) {
      const pathList = formCheckList.map((formData) => formData.path);
      setIsAllFormChecked(
        forms.every((formData) => pathList.includes(formData.path))
      );
    } else {
      setIsAllFormChecked(false);
    }
  }, [formCheckList, forms]);

  const updateFormCheckList = (formInsert) => {
    let updatedFormCheckList = [...formCheckList];
    if (formInsert) {
      updatedFormCheckList.push({ ...formObj });
    } else {
      const index = updatedFormCheckList.findIndex(
        (formData) => formData.path === formObj.path
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
          (formCheck) => formData.path === formCheck.path
        );
        if (!isFormAdded) {
          let formObjToInsert = getFormattedForm(formData);
          updatedFormCheckList.push({ ...formObjToInsert });
        }
      });
      dispatch(setFormCheckList(updatedFormCheckList));
    }
  };

  if (type === "all") {
    return (
      <div className="container select_download">
        <h6 className="select_text mr-2 mt-1">{t("Select All")}</h6>
      <Form.Check
        className="form_check" 
      >
        <Form.Check.Input
          className="select_input"
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
        style={{ width: "15px", height: "15px" }}
        aria-label="option"
        checked={isFormChecked}
        onChange={() => updateFormCheckList(!isFormChecked)}
        title={t("Select for download")}
      />
    </Form.Check>
  );
});
export default SelectFormForDownload;