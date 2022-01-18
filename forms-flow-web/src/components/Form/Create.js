
import React from "react";
import { connect } from "react-redux";
import { saveForm, selectError, FormEdit, Errors } from "react-formio";
import { push } from "connected-react-router";
import { Translation } from "react-i18next";
import { SUBMISSION_ACCESS } from "../../constants/constants";
import { addHiddenApplicationComponent } from "../../constants/applicationComponent";
import { formio_translation } from "../../translations/formiotranslation";
//import {useSelector } from 'react-redux';
const Create = React.memo((props) => {
  //const {t} = useTranslation();
  //const lang = useSelector((state) => state.user.lang);
  return (
    <div>
      <h2><Translation>{(t)=>t("create_form")}</Translation></h2>
      <hr />
      <Errors errors={props.errors} />
      <FormEdit options={{
							language: props.lang,
							i18n: formio_translation
							}}{...props} />
    </div>
  );
});

const mapStateToProps = (state) => {
  return {
    form: { display: "form" },
    saveText: <Translation>{(t)=>t("save_preview")}</Translation>,
    errors: selectError("form", state),
    lang : state.user.lang
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
