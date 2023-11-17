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
 const CreateWorkflow = () => {
    //select typeOf workflow form useSelector / redux
    const isBpmnModel = useSelector((state) => state.process.isBpmnModel);
    const diagramXML = useSelector((state) => state.process.processDiagramXML);
    const dispatch = useDispatch();
    
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
 
         {isBpmnModel ? (
            <BpmnEditor 
              mode="Create"
              processKey={''}
              tenant={''}
              isNewDiagram={true}
              bpmnXml={diagramXML}
            />
          ) : (
            <DmnEditor 
              mode="Create"
              processKey={''}
              tenant={''}
              isNewDiagram={true}
            />
          )}
    </div>
  );
};

export default CreateWorkflow;