import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { push } from "connected-react-router";
import {
  CLIENT,
  MULTITENANCY_ENABLED,
  STAFF_DESIGNER,
  STAFF_REVIEWER,
} from "../../../constants/constants";
import {
  setIsApplicationCountLoading,
  setResetProcess,
} from "../../../actions/processActions";
import { setFormDeleteStatus } from "../../../actions/formActions";
import {
  getFormProcesses,
  resetFormProcessData,
  getAllApplicationCount
} from "../../../apiManager/services/processServices";

import { Translation } from "react-i18next";

const FormOperations = React.memo(({ formData }) => {
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const dispatch = useDispatch();
  const userRoles = useSelector((state) => state.user.roles);
  const submitNewForm = (formId) => {
    dispatch(push(`${redirectUrl}form/${formId}`));
  };
  const viewOrEditForm = (formId) => {
    dispatch(resetFormProcessData());
    dispatch(setResetProcess());
    dispatch(push(`${redirectUrl}formflow/${formId}/view-edit`));
  };
  const deleteForms = (formData) => {
    dispatch(setIsApplicationCountLoading(true));
    dispatch(
      getFormProcesses(formData._id, (err, data) => {
        const formDetails = {
          modalOpen: true,
          formId: formData._id,
          formName: formData.title,
          path: formData.path,
        };
        if (data) {
          dispatch(
            // eslint-disable-next-line no-unused-vars
              getAllApplicationCount(formData._id,(err, res) => {
              dispatch(setIsApplicationCountLoading(false));
              dispatch(setFormDeleteStatus(formDetails));
            })
          );
        } else {
          dispatch(setIsApplicationCountLoading(false));
          dispatch(setFormDeleteStatus(formDetails));
        }
      })
    );
  };
  
  const submitNew = (
    <button
      className="btn  btn-primary me-2"
      onClick={() => submitNewForm(formData._id)}
    >
      <i className="fa fa-pencil me-1" />
      <Translation>{(t) => t("Submit New")}</Translation>
    </button>
  );
  const viewOrEdit = (
    <button
      className="btn btn-link mt-1"
      onClick={() => viewOrEditForm(formData._id)}
    >
      <Translation>{(t) => t("View Details")}</Translation>{" "}
    </button>
  );
  const deleteForm = (
    <i
      className="fa fa-trash fa-lg delete_button"
      onClick={() => deleteForms(formData)}
    />
  );

  let buttons = {
    CLIENT_OR_REVIEWER: [submitNew],
    STAFF_DESIGNER: [viewOrEdit, deleteForm],
  };
  const formButtonOperations = () => {
    let operationButtons = [];
    if (userRoles.includes(CLIENT) || userRoles.includes(STAFF_REVIEWER)) {
      operationButtons.push(buttons.CLIENT_OR_REVIEWER);
    }
    if (userRoles.includes(STAFF_DESIGNER)) {
      operationButtons.push(buttons.STAFF_DESIGNER); //  OPERATIONS.edit,
    }
    return operationButtons;
  };
  return (
    <>
      <span>{formButtonOperations()}</span>
    </>
  );
});
export default FormOperations;
