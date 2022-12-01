import { Translation } from "react-i18next";
export const SearchByLastName = "lastName";
export const SearchByFirstName = "firstName";
export const SearchByEmail = "email";

export const UserSearchFilterTypes = [
  {
    searchType: SearchByLastName,
    title: <Translation>{(t) => t("Search By Last Name")}</Translation>,
  },
  {
    searchType: SearchByFirstName,
    title: <Translation>{(t) => t("Search By First Name")}</Translation>,
  },
  {
    searchType: SearchByEmail,
    title: <Translation>{(t) => t("Search By Email")}</Translation>,
  },
];
