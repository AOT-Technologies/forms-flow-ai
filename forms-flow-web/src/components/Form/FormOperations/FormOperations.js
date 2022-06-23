import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { push } from "connected-react-router";
import {
  CLIENT,
  STAFF_DESIGNER,
  STAFF_REVIEWER,
} from "../../../constants/constants";
import {
  setIsApplicationCountLoading,
  setResetProcess,
} from "../../../actions/processActions";
import { setFormDeleteStatus } from "../../../actions/formActions";
import {
  getApplicationCount,
  getFormProcesses,
  resetFormProcessData,
} from "../../../apiManager/services/processServices";

const FormOperations = React.memo(({ formData }) => {
  const redirectUrl = "/";
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
      getFormProcesses(formData, (err, data) => {
        const formDetails = {
          modalOpen: true,
          formId: formData._id,
          formName: formData.title,
          path: formData.path,
        };
        if (data) {
          dispatch(
            // eslint-disable-next-line no-unused-vars
            getApplicationCount(data.id, (err, res) => {
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
  let roles = { CLIENT, STAFF_DESIGNER, STAFF_REVIEWER };
  const submitNew = (
    <button
      className="btn  btn-primary operation_buttons"
      onClick={() => submitNewForm(formData._id)}
    >
      <i className="fa fa-pencil mr-1" />
      Submit New
    </button>
  );
  const viewOrEdit = (
    <button
      className="btn  btn-primary operation_buttons"
      onClick={() => viewOrEditForm(formData._id)}
    >
      <i className="fa fa-pencil-square-o mr-1" />
      View/Edit Form
    </button>
  );
  const deleteForm = (
    <i
      className="fa fa-trash fa-lg delete_button"
      onClick={() => deleteForms(formData)}
    />
  );

  let buttons = {
    CLIENT: [submitNew],
    STAFF_DESIGNER: [viewOrEdit, deleteForm],
    STAFF_REVIEWER: [submitNew],
  };

  const formButtonOperations = () => {
    let rolesKeys = Object.keys(roles);
    let rolesValues = Object.values(roles);
    let operationButtons = [];
    rolesValues.forEach((e, i) => {
      if (userRoles.includes(e)) {
        operationButtons.push(
          ...buttons[rolesKeys[i]].filter((e) => !operationButtons.includes(e))
        );
      }
    });
    return operationButtons;
  };
  return (
    <>
      <span>{formButtonOperations()}</span>
    </>
  );
});
export default FormOperations;
