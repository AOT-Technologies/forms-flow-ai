import React, {useEffect} from 'react';
import { useSelector } from 'react-redux';
import BpmnEditor from './Editors/BpmnEditor';
import DmnEditor from './Editors/DmnEditor';
import {
  createNewDecision,
  createNewProcess,
} from "./helpers/helper";
import { useDispatch } from 'react-redux';
import {
  setProcessDiagramXML, 
} from "../../actions/processActions";
import { useTranslation } from "react-i18next";
const CreateWorkflow = () => {
    //select typeOf workflow form useSelector / redux
    const isBpmnModel = useSelector((state) => state.process.isBpmnModel);
    const diagramXML = useSelector((state) => state.process.processDiagramXML);
    const dispatch = useDispatch();
    const { t } = useTranslation();
   
    useEffect(()=>{
       if(!diagramXML){
        const newProcess = isBpmnModel ? createNewProcess() : createNewDecision();
        dispatch(setProcessDiagramXML(newProcess.defaultWorkflow.xml));
       }
    },[isBpmnModel]);

    useEffect(()=>{
      return () => {
        dispatch(setProcessDiagramXML(''));
      };
    },[]);

 
  return (
    <div>
        <div className="flex-item-left">
          <div style={{ display: "flex" }}>
            <h3 className="task-head" style={{ marginTop: "3px" }}>
              <i className="fa fa-cogs" aria-hidden="true" />
            </h3>
            <h3 className="task-head">
              {" "}
              <span className="forms-text" style={{ marginLeft: "1px" }}>
                {t("Processes")}
              </span>
            </h3>
          </div>
        </div>
         {isBpmnModel ? (
            <BpmnEditor 
              processKey={''}
              tenant={''}
              isNewDiagram={true}
              bpmnXml={diagramXML}
            />
          ) : (
            <DmnEditor 
              processKey={''}
              tenant={''}
              isNewDiagram={true}
            />
          )}
    </div>
  );
};

export default CreateWorkflow;