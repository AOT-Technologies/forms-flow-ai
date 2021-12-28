 /* istanbul ignore file */
const compareFn = (a,b) => {
  const priority1=a?.properties?.priority||0;
  const priority2=b?.properties?.priority||0;
  return priority1-priority2;
}

export const sortByPriorityList = (filterList)=>{
  return filterList.sort(compareFn);
}
