
import React from "react";
import { connect } from "react-redux";
import { saveForm, selectError, FormEdit, Errors } from "react-formio";
import { push } from "connected-react-router";

import { SUBMISSION_ACCESS } from "../../constants/constants";
import { addHiddenApplicationComponent } from "../../constants/applicationComponent";

const Create = React.memo((props) => {
  return (
    <div>
      <h2>Create Form</h2>
      <hr />
      <Errors errors={props.errors} />
      <FormEdit {...props} />
    </div>
  );
});

const mapStateToProps = (state) => {
  return {
    form: { display: "form" },
    saveText: "Save & Preview",
    errors: selectError("form", state),
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    saveForm: (form) => {
      form = addHiddenApplicationComponent(form);
      const newForm = {
        ...form,
        tags: ["common"],
      };
      newForm.submissionAccess = SUBMISSION_ACCESS;
      dispatch(
        saveForm("form", newForm, (err, form) => {
          if (!err) {
            // ownProps.setPreviewMode(true);
            dispatch(push(`/formflow/${form._id}/view-edit/`));
          }
        })
      );
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Create);
