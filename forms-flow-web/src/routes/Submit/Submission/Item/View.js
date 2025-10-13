import React, { useMemo } from "react";
import { connect, useSelector } from "react-redux";
import {
  selectRoot,
  resetSubmissions,
  saveSubmission,
  Form,
  selectError,
} from "@aot-technologies/formio-react";
import { push } from "connected-react-router";
import { useLocation } from "react-router-dom";
import Loading from "../../../../containers/Loading";
import { setFormSubmissionLoading } from "../../../../actions/formActions";
import LoadingOverlay from "react-loading-overlay-ts";
import { useTranslation } from "react-i18next";
import { RESOURCE_BUNDLES_DATA } from "../../../../resourceBundles/i18n";
import {
  CUSTOM_SUBMISSION_URL,
  CUSTOM_SUBMISSION_ENABLE,
} from "../../../../constants/constants";
import { updateCustomSubmission } from "../../../../apiManager/services/FormServices";
import PropTypes from "prop-types";
const View = React.memo((props) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { 
    onSubmit,
    options,
    form: { form, isActive: isFormActive },
    submission: { submission, isActive: isSubActive, url },
  } = props;
  const isFormSubmissionLoading = useSelector(
    (state) => state.formDelete.isFormSubmissionLoading
  );

  const customSubmission = useSelector(
    (state) => state.customSubmission?.submission || {}
  );

  // Check if the route has from=formEntries query parameter
  const queryParams = new URLSearchParams(location.search);
  const fromParam = queryParams.get('from');
  const shouldShowFormTitle = fromParam !== 'formEntries';

  const updatedSubmission = useMemo(()=>{
    if (CUSTOM_SUBMISSION_URL && CUSTOM_SUBMISSION_ENABLE) {
      return customSubmission;
    } else {
      return submission;
    }
  },[customSubmission,submission]);

  if (isFormActive || (isSubActive && !isFormSubmissionLoading) || !updatedSubmission?.data) {
    return <Loading />;
  }

  let scrollableOverview = "scrollable-overview";
  if (form?.display === "wizard") {
    scrollableOverview =  "scrollable-overview-with-custom-header-and-wizard";
  }
 

  return (
    <div className={`${scrollableOverview} bg-white ps-3 pe-3 m-0 form-border`}>
      <LoadingOverlay
        active={isFormSubmissionLoading}
        spinner
        text={t("Loading...")}
        className="col-12"
      ><div className="form-preview-tab">
        {shouldShowFormTitle && (
          <div className="preview-header-text mb-4">{form?.title}</div>
        )}
        <div className="sub-container wizard-tab">
          <Form
            src={form}
            submission={updatedSubmission}
            url={url}
            onSubmit={onSubmit}
            options={{
              ...options,
              i18n: RESOURCE_BUNDLES_DATA,
              viewAsHtml: true,
              buttonSettings: { showCancel: false },
            }}
          />
        </div>
        </div>
      </LoadingOverlay>
    </div>
  );
});

View.propTypes = {
  onSubmit: PropTypes.func,
  options: PropTypes.object,
  form: PropTypes.object,
  submission: PropTypes.object,
};


const mapStateToProps = (state, props) => {
  const isDraftView = props.page === "draft-detail";
  return {
    form: selectRoot("form", state),
    submission: isDraftView
      ? selectRoot("draft", state)
      : selectRoot("submission", state),
    options: {
      readOnly: true,
      language: state.user.lang,
    },
    errors: [selectError("submission", state), selectError("form", state)],
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSubmit: (submission) => {
      dispatch(setFormSubmissionLoading(true));
      const callBack = (err, submission) => {
        if (!err) {
          dispatch(resetSubmissions("submission"));
          dispatch(setFormSubmissionLoading(false));
          dispatch(
            push(
              `/form/${ownProps.match.params.formId}/submission/${submission._id}`
            )
          );
        } else {
          dispatch(setFormSubmissionLoading(false));
        }
      };
      if (CUSTOM_SUBMISSION_URL && CUSTOM_SUBMISSION_ENABLE) {
        updateCustomSubmission(
          submission,
          ownProps.match.params.formId,
          callBack
        );
      } else {
        dispatch(
          saveSubmission(
            "submission",
            submission,
            ownProps.match.params.formId,
            callBack
          )
        );
      }
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(View);
