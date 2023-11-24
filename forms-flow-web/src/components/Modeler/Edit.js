import React, {  useEffect, useState} from 'react';
import { useSelector } from 'react-redux';
import BpmnEditor from './Editors/BpmnEditor';
import { useParams } from "react-router-dom";
import DmnEditor from './Editors/DmnEditor';
import { useDispatch } from 'react-redux';
import { push } from "connected-react-router";
import {
    fetchDiagram,
  } from "../../apiManager/services/processServices";
 import Loading from '../../containers/Loading';
import { setIsPublicDiagram, setProcessDiagramXML } from '../../actions/processActions';
import { MULTITENANCY_ENABLED } from '../../constants/constants';

const EditWorkflow = () => {
    //select typeOf workflow form useSelector / redux
    const tenantKey = useSelector((state) => state.tenants?.tenantId);
    const {processId, type} = useParams(); 
    const dispatch = useDispatch();
    const [diagramLoading, setDiagramLoading] = useState(false);
    const diagramXML = useSelector((state) => state.process.processDiagramXML);
    const isPublicDiagram = useSelector((state) => state.process.isPublicDiagram);
    const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";

    useEffect(()=>{
      setDiagramLoading(true);
      if(MULTITENANCY_ENABLED && isPublicDiagram === null){
        dispatch(push(`${redirectUrl}processes`));
      }
      else{
        const updatedTenantKey = (MULTITENANCY_ENABLED && !isPublicDiagram) ? null : tenantKey;
        dispatch(fetchDiagram(processId,updatedTenantKey, type === "bpmn" ? false : true,()=>{
         setDiagramLoading(false);
        }));
      }  
    },[processId]);

    useEffect(()=>{
      return () => {
        dispatch(setProcessDiagramXML(''));
        dispatch(setIsPublicDiagram(null));
      };
    },[]);


    if(diagramLoading){
      return <Loading/>;
    }
  return (
    <div>
 
         {type === "bpmn" ? (
            diagramXML ?
            <BpmnEditor
              mode="Edit"
              processKey={processId}
              tenant={tenantKey}
              isNewDiagram={false}
              bpmnXml={diagramXML}
            /> :  null
          ) : (
            diagramXML ?
            <DmnEditor
              mode="Edit"
              processKey={processId}
              tenant={tenantKey}
              isNewDiagram={false}
            /> : null
          )}
    </div>
  );
};

export default EditWorkflow;