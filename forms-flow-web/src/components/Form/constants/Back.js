import React from 'react'
import {Link} from "react-router-dom";
import { useTranslation } from 'react-i18next'
const Back = () => {
    const {t} = useTranslation();
  return (
    <div>
      <Link to="/form" title={t("Back to Form List")}>
    <i className="fa fa-chevron-left fa-lg" />
    </Link>
    </div>
  )
}
export default Back