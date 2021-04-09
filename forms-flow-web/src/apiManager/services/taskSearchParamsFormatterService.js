import {Filter_Search_Types} from "../../components/ServiceFlow/constants/taskConstants";

export const getFormattedParams = (searchList, searchQueryType, variableNameIgnoreCase, variableValueIgnoreCase)=>{
  //TODO update this to include more params and types
  return searchList;
}
export const isVariableTypeAvailable = (filterSelections)=>{
  return filterSelections.some(filter=>filter.type===Filter_Search_Types.VARIABLES);
}
