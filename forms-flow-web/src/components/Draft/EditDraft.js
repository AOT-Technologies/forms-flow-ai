import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Loading from "../../containers/Loading";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import { getDraftById } from "../../apiManager/services/draftService";
import UserForm from "../../routes/Submit/Forms/UserForm";
import { push } from "connected-react-router";

const EditDraft = React.memo(() => {
  const { draftId } = useParams();

  const [draftLoading, setDraftLoading] = useState(true);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const dispatch = useDispatch();
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";

  useEffect(() => { 
    dispatch(
      getDraftById(draftId, (err) => {
        setDraftLoading(false);
        if (err) {
          dispatch(push(`${redirectUrl}404`));
        }  
      })
    );
  }, [draftId, dispatch]);

  // loading till draft data get
  if (draftLoading) {
    return <Loading />;
  }
  return <UserForm page="draft-edit" />;
});

export default EditDraft;
