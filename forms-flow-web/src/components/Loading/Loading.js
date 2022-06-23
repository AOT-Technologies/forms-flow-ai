import React from "react";
import "./loading.scss";
import { useTranslation } from "react-i18next";

const Loading = React.memo(() => {
  const { t } = useTranslation();
  return (
    <div className="row ">
      <div className="col-12">{t("Loading...")}</div>
    </div>
  );
});
export default Loading;
