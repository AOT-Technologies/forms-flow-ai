import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import Checkbox from "@material-ui/core/Checkbox";
import {setIsVariableNameIgnoreCase, setIsVariableValueIgnoreCase} from "../../../../actions/bpmTaskActions";
import {isVariableTypeAvailable} from "../../../../apiManager/services/taskSearchParamsFormatterService";
import { Trans } from "react-i18next";
const TaskIgnoreCaseComponent = React.memo(()=>{
  const variableNameIgnoreCase = useSelector(state => state.bpmTasks.variableNameIgnoreCase);
  const variableValueIgnoreCase = useSelector(state => state.bpmTasks.variableValueIgnoreCase);
  const filterSelections = useSelector(state => state.bpmTasks.filterSearchSelections);
  const [isVariableTypeInFilter, setIsVariableTypeInFilter] = useState(false);
  const dispatch= useDispatch();

  const setVariableNameIgnoreCase=(isIgnoreCase)=>{
    dispatch(setIsVariableNameIgnoreCase(isIgnoreCase))
  }

  const setVariableValueIgnoreCase = (isIgnoreCase)=>{
    dispatch(setIsVariableValueIgnoreCase(isIgnoreCase))
  }

  useEffect(()=>{
    setIsVariableTypeInFilter(isVariableTypeAvailable(filterSelections));
  },[filterSelections]);

  return <>{ filterSelections.length && isVariableTypeInFilter? <div>
          <span className="name-value-container"><Trans>{"for_variables"}</Trans>
            <Checkbox
              className="check-box-design"
              checked={variableNameIgnoreCase}
              onChange={()=>setVariableNameIgnoreCase(!variableNameIgnoreCase)}
              inputProps={{'aria-label': 'primary checkbox'}}
            />
            <Trans>{"name_1"}</Trans>
            <Checkbox
              className="check-box-design"
              checked={variableValueIgnoreCase}
              onChange={()=>setVariableValueIgnoreCase(!variableValueIgnoreCase)}
              inputProps={{'aria-label': 'primary checkbox'}}
            /><Trans>{"value"}</Trans> 
          </span>
    {/*<span className="filter-action-container">  <i className="fa fa-link item-pos" aria-hidden="true"/><i
            className="fa fa-floppy-o item-pos" aria-hidden="true"/></span>*/}
  </div> : null}</>

})

export default TaskIgnoreCaseComponent;
