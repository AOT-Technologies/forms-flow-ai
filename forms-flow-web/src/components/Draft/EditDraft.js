import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Loading from "../../containers/Loading";
import { getForm, getSubmission } from "react-formio";
// import { Translation } from "react-i18next";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import { getDraftById } from "../../apiManager/services/draftService";
import Edit from "./Edit";
import { push } from "connected-react-router";

const EditDraft = React.memo(() => {
  const { draftId } = useParams();

  const isDraftDetailLoading = useSelector(
    (state) => state.draft.isDraftDetailLoading
  );

  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const dispatch = useDispatch();
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";

  useEffect(() => {
    dispatch(
      getDraftById(draftId, (err, res) => {
        if (!err) {
          if (res.id && res.formId) {
            dispatch(getForm("form", res.formId));
            dispatch(getSubmission("submission", res.submissionId, res.formId));
          }
        } else {
          dispatch(push(`${redirectUrl}404`));
        }
      })
    );
    return () => {
      //   dispatch(setApplicationDetailLoader(true));
      //   dispatch(setApplicationDetailStatusCode(""));
    };
  }, [draftId, dispatch]);

  if (isDraftDetailLoading) {
    return <Loading />;
  }
  return <Edit page="draft-edit" />;
});

export default EditDraft;
