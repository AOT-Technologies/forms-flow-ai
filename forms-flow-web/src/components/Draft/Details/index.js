import React from "react";
import LoadingOverlay from "react-loading-overlay";

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
      <div className="row" style={{ marginTop: "26.5px", fontWeight: "500px" }}>
        <div className="col-md-6">
          <DraftDetails draft={props.draft} />
        </div>
      </div>
    </LoadingOverlay>
  );
});

export default Details;
