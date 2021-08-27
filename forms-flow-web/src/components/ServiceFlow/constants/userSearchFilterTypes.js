import { Trans } from "react-i18next";
export const SearchByLastName = "lastNameLike";
export const SearchByFirstName = "firstNameLike";
export const SearchByEmail = "emailLike";

export const UserSearchFilterTypes = [{
  searchType: SearchByLastName,
  title:<Trans>{"search_lastname"}</Trans>
},{
  searchType: SearchByFirstName,
  title:<Trans>{"search_firstname"}</Trans>
},{
  searchType: SearchByEmail,
  title:<Trans>{"search_email"}</Trans>
}];
