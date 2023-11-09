import React, {  useEffect, useState} from 'react';
import { useSelector } from 'react-redux';
import BpmnEditor from './Editors/BpmnEditor';
import { useParams } from "react-router-dom";
import DmnEditor from './Editors/DmnEditor';
import { useDispatch } from 'react-redux';
import {
    fetchDiagram,
  } from "../../apiManager/services/processServices";
 import Loading from '../../containers/Loading';
import { setProcessDiagramXML } from '../../actions/processActions';
const EditWorkflow = () => {
    //select typeOf workflow form useSelector / redux
     const tenantKey = useSelector((state) => state.tenants?.tenantId);
    const {processId, type} = useParams(); 
    const dispatch = useDispatch();
    const [diagramLoading, setDiagramLoading] = useState(false);
     const diagramXML = useSelector((state) => state.process.processDiagramXML);
 

    useEffect(()=>{
      setDiagramLoading(true);
         dispatch(fetchDiagram(processId, tenantKey, type === "bpmn" ? false : true,()=>{
          setDiagramLoading(false);
         }));
    },[processId]);

    useEffect(()=>{
      return () => {
        dispatch(setProcessDiagramXML(''));
      };
    },[]);


    if(diagramLoading){
      return <Loading/>;
    }
  return (
    <div>
 
         {type === "bpmn" ? (
            <BpmnEditor
            mode="Edit"
              processKey={processId}
              tenant={tenantKey}
              isNewDiagram={false}
              bpmnXml={diagramXML}
            />
          ) : (
            <DmnEditor
            mode="Edit"
              processKey={processId}
              tenant={tenantKey}
              isNewDiagram={false}
            />
          )}
    </div>
  );
};

export default EditWorkflow;