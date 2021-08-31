import React from "react";
import { useTranslation } from "react-i18next";
import "../../translations/i18n";
 
export const MyComponent = () => {
const { t } = useTranslation();
return (
     {t}
);
};
export default MyComponent;