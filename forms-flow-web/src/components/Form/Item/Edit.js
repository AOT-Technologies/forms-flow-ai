import React from "react";
import { connect } from "react-redux";
import {
  saveForm,
  selectForm,
  FormEdit,
  Errors,
  selectError,
} from "react-formio";
import { push } from "connected-react-router";
/*import { Link } from "react-router-dom";*/
import { SUBMISSION_ACCESS } from "../../../constants/constants";
import {addHiddenApplicationComponent} from "../../../constants/applicationComponent";

const Edit = (props) => (
  <div className="container">
    <div className="main-header">
      {/* <Link to="/form">
            <img src="/back.svg" alt="back" />
          </Link> */}
     {/* <span className="ml-3">
        <img src="/form.svg" alt="Forms" />
      </span>*/}
      <h3  className="ml-3 task-head"><i className="fa fa-wpforms" aria-hidden="true"/> &nbsp; {props.form.title}</h3>
    </div>

    <hr />
    <Errors errors={props.errors} />
    <FormEdit {...props} />
  </div>
);

const mapStateToProps = (state) => {
  return {
    form: selectForm("form", state),
    saveText: "Save Form",
    errors: selectError("form", state),
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    saveForm: (form) => {
      form = addHiddenApplicationComponent(form);
      form.submissionAccess = SUBMISSION_ACCESS;
      return dispatch(
        saveForm("form", form, (err, form) => {
          if (!err) {
            // TODO: Display a save success message here.
            dispatch(push(`/formflow/${form._id}/preview`));
            // ownProps.setPreviewMode(true);
          }
        })
      );
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Edit);
