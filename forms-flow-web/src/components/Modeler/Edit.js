import React, {  useEffect, useState} from 'react';
import { useSelector } from 'react-redux';
import BpmnEditor from './Editors/BpmnEditor';
import { useParams } from "react-router-dom";
import DmnEditor from './Editors/DmnEditor';
import { useDispatch } from 'react-redux';
import {
    fetchDiagram,
  } from "../../apiManager/services/processServices";
import { useTranslation } from "react-i18next";
import Loading from '../../containers/Loading';
import { setProcessDiagramXML } from '../../actions/processActions';
const EditWorkflow = () => {
    //select typeOf workflow form useSelector / redux
     const tenantKey = useSelector((state) => state.tenants?.tenantId);
    const {processId, type} = useParams(); 
    const dispatch = useDispatch();
    const [diagramLoading, setDiagramLoading] = useState(false);
    const { t } = useTranslation();
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
         {type === "bpmn" ? (
            <BpmnEditor
              processKey={processId}
              tenant={tenantKey}
              isNewDiagram={false}
              bpmnXml={diagramXML}
            />
          ) : (
            <DmnEditor
              processKey={processId}
              tenant={tenantKey}
              isNewDiagram={false}
            />
          )}
    </div>
  );
};

export default EditWorkflow;