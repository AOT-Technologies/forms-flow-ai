import { Translation } from "react-i18next";
export const SearchByLastName = "lastNameLike";
export const SearchByFirstName = "firstNameLike";
export const SearchByEmail = "emailLike";

export const UserSearchFilterTypes = [{
  searchType: SearchByLastName,
  title:<Translation>{(t)=>t("search_lastname")}</Translation>
},{
  searchType: SearchByFirstName,
  title:<Translation>{(t)=>t("search_firstname")}</Translation>
},{
  searchType: SearchByEmail,
  title:<Translation>{(t)=>t("search_email")}</Translation>
}];
