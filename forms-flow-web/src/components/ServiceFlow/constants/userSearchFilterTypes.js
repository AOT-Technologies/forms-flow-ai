/* istanbul ignore file */
export const SearchByLastName = "lastNameLike";
export const SearchByFirstName = "firstNameLike";
export const SearchByEmail = "emailLike";

export const UserSearchFilterTypes = [{
  searchType: SearchByLastName,
  title:'Search By Last Name'
},{
  searchType: SearchByFirstName,
  title:'Search By First Name'
},{
  searchType: SearchByEmail,
  title:'Search By Email'
}];
