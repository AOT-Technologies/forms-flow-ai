 /* istanbul ignore file */
import {
  FILTER_OPERATOR_TYPES,
  Filter_Search_Types, MAX_RESULTS,
  QUERY_TYPES
} from "../../components/ServiceFlow/constants/taskConstants";


const getProcessedParamObject = (searchOption) => {
  const option= {};
  if(searchOption.operator===FILTER_OPERATOR_TYPES.EQUAL) {
    option[searchOption.key] = searchOption.value;
  }
  else if(searchOption.operator===FILTER_OPERATOR_TYPES.LIKE){
    option[`${searchOption.key}Like`] = `%${searchOption.value}%`;
  }else if(searchOption.operator===FILTER_OPERATOR_TYPES.BEFORE){
    option[`${searchOption.key}Before`] = searchOption.value;
  }else if(searchOption.operator===FILTER_OPERATOR_TYPES.AFTER){
    option[`${searchOption.key}After`] = searchOption.value;
  }

  return option;
}

const getVariableOperator = (operator)=>{
 switch(operator){
   case "=":
     return 'eq';
   case ">":
     return "gt";
   case ">=":
     return "gteq";
   case "!=":
     return "neq";
   case "<":
     return "lt";
   case "<=":
     return "lteq";
   case "like":
     return "like";
   default:
 }
}

export const getFormattedParams = (searchOptionList, searchQueryType, variableNameIgnoreCase, variableValueIgnoreCase)=>{
  let resultList={};
  let paramList={};
  let isParamsHasValue=false;
  if(searchOptionList.length===0){
  return paramList;
  }
  paramList={processVariables: [],taskVariables:[]};

  searchOptionList.forEach((searchOption)=>{
    switch(searchOption.type){
      case Filter_Search_Types.VARIABLES:
        if(searchOption.value!==(undefined||null||'') && searchOption.name){
          isParamsHasValue=true;
          paramList[searchOption.key].push({name: searchOption.name, operator: getVariableOperator(searchOption.operator), value: searchOption.operator==="like"?`%${searchOption.value}%`:searchOption.value})
        }
        break;
      case Filter_Search_Types.STRING:
      case Filter_Search_Types.NORMAL:
      case Filter_Search_Types.DATE:
        if(searchOption.value){
          isParamsHasValue=true;
          let param= getProcessedParamObject(searchOption);
          paramList ={...paramList,...param}
        }
        break;
      default:
      }
    });


  const isVariableType = isVariableTypeAvailable(searchOptionList);
  if(isVariableType){
    paramList={...paramList,...{variableNamesIgnoreCase: variableNameIgnoreCase,
        variableValuesIgnoreCase: variableValueIgnoreCase}}
  }
  if(searchQueryType===QUERY_TYPES.ALL){
    resultList=paramList;
  }else if(searchQueryType===QUERY_TYPES.ANY){
    resultList={orQueries:[paramList]}
  }
  return isParamsHasValue?resultList:{};
}

export const isVariableTypeAvailable = (filterSelections)=>{
  return filterSelections.some(filter=>filter.type===Filter_Search_Types.VARIABLES);
}

export const getFirstResultIndex = (activePage) => {
 return activePage * MAX_RESULTS - MAX_RESULTS;
}
