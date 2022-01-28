import React, { useEffect } from "react";
import { saveForm, FormEdit, Errors } from "react-formio";
import { push } from "connected-react-router";
import { useHistory } from "react-router-dom";
/*import { Link } from "react-router-dom";*/
import {
  SUBMISSION_ACCESS,
  ANONYMOUS_ID,
  FORM_ACCESS,
} from "../../../constants/constants";
import { addHiddenApplicationComponent } from "../../../constants/applicationComponent";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import {
  setFormProcessesData,
  setFormPreviosData,
} from "../../../actions/processActions";
import { saveFormProcessMapper } from "../../../apiManager/services/processServices";

const Edit = React.memo(() => {
  const dispatch = useDispatch();
  const processListData = useSelector((state) => state.process.formProcessList);
  const formData = useSelector((state) => state.form.form);
  const errors = useSelector((state) => state.form.error);
  const prviousData = useSelector((state) => state.process.formPreviousData);
  const saveText = "Save Form";
  const history = useHistory();

  const changeAnonymous = () => {
    let latestValue = !processListData.anonymous;
    let newData = {
      ...processListData,
      anonymous: latestValue,
    };
    dispatch(setFormProcessesData(newData));
  };

  //  chaning the form access
  useEffect(() => {
    FORM_ACCESS.forEach((role) => {
      if (processListData.anonymous) {
        role.roles.push(ANONYMOUS_ID);
      } else {
        role.roles = role.roles.filter((id) => id !== ANONYMOUS_ID);
      }
    });

    SUBMISSION_ACCESS.forEach((access) => {
      if (processListData.anonymous) {
        if (access.type === "create_own") {
          access.roles.push(ANONYMOUS_ID);
        }
      } else {
        if (access.type === "create_own") {
          access.roles = access.roles.filter((id) => id !== ANONYMOUS_ID);
        }
      }
    });
  }, [processListData]);

  const saveFormData = (form) => {
    form = addHiddenApplicationComponent(form);
    form.submissionAccess = SUBMISSION_ACCESS;
    form.access = FORM_ACCESS;
    dispatch(
      saveForm("form", form, (err, submittedData) => {
        if (!err) {
          // checking any changes
          if (
            prviousData.formName !== submittedData.title ||
            prviousData.anonymous !== processListData.anonymous ||
            processListData.anonymous === null
          ) {
            let anonymousUpdate =
              processListData.anonymous === null
                ? false
                : processListData.anonymous;
            const data = {
              anonymous: anonymousUpdate,
              formName: submittedData.title,
              id: processListData.id,
              formId: submittedData._id,
            };
            const updated =
              processListData && processListData.id ? true : false;
            dispatch(saveFormProcessMapper(data, updated));
            let newData = {
              ...processListData,
              formName: submittedData.title,
            };
            dispatch(setFormProcessesData(newData));
            dispatch(setFormPreviosData(newData));
          }
          toast.success("Form Saved");
          dispatch(push(`/formflow/${submittedData._id}/preview`));
          // ownProps.setPreviewMode(true);
        } else {
          toast.error("Error while saving Form");
        }
      })
    );
  };

  return (
    <div className="container">
      <div className="main-header">
        {/* <Link to="/form">
            <img src="/back.svg" alt="back" />
          </Link> */}
        {/* <span className="ml-3">
        <img src="/form.svg" alt="Forms" />
      </span>*/}
        <h3 className="ml-3 task-head">
          <i className="fa fa-wpforms" aria-hidden="true" /> &nbsp;{" "}
          {formData.title}
        </h3>
      </div>

      <hr />
      <Errors errors={errors} />
      <div class="form-check text-right">
        <input
          class="form-check-input big-checkbox"
          type="checkbox"
          checked={processListData.anonymous || false}
          onChange={(e) => {
            changeAnonymous();
          }}
        />
        <label class="pl-2 form-check-label" for="flexCheckDefault">
          Anonymous Form
        </label>
      </div>
      <div className="d-flex justify-content-end mt-3">
        <button
          onClick={() => {
            history.goBack();
          }}
          className="btn btn-danger"
        >
          Cancel
        </button>
      </div>
      <FormEdit
        form={formData}
        saveText={saveText}
        saveForm={(form) => saveFormData(form)}
      />
    </div>
  );
});
export default Edit;
