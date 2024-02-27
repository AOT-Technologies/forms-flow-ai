import React from "react";
import LoadingOverlay from "react-loading-overlay-ts";

import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import DraftDetails from "./DraftDetails";

const Details = React.memo((props) => {
  const { t } = useTranslation();
  const isDraftDetailLoading = useSelector(
    (state) => state.draft.isDraftDetailLoading
  );
  return (
    <LoadingOverlay
      active={isDraftDetailLoading}
      spinner
      text={t("Select a task in the list.")}
    >
      <div className="row m-0 bg-white py-3 draft-details">
        <div className="col-md-6 px-0">
          <DraftDetails draft={props.draft} />
        </div>
      </div>
    </LoadingOverlay>
  );
});

export default Details;
