
import React, {useRef, useEffect, useLayoutEffect} from 'react';
import {useDispatch,useSelector} from "react-redux";

// import BpmnJS from 'bpmn-js/dist/bpmn-navigated-viewer.production.min.js';
//import Loading from "../../containers/Loading";

import {fetchDiagram} from "../../apiManager/services/processServices";
import {setProcessDiagramLoading} from "../../actions/processActions";
import "./bpm.scss"
import BpmnJS from 'bpmn-js';

const ProcessDiagram = (props)=>{
  const process_key = props.process_key;
  const containerRef = useRef(null);
  const dispatch= useDispatch();
  //const isProcessDiagramLoading = useSelector(state=>state.process.isProcessDiagramLoading);
  const diagramXML = useSelector(state => state.process.processDiagramXML);

  const container = containerRef.current;


  useEffect(()=>{
    dispatch(setProcessDiagramLoading(true));
    // console.log('process_key >>',process_key);
    if(process_key){
      dispatch(fetchDiagram(process_key));
      //console.log('diagramXML >>',diagramXML);
    }
  },[process_key,dispatch])

 useLayoutEffect(()=> {
   if(diagramXML && container){
     const bpmnViewer = new BpmnJS({ container });
     bpmnViewer.on('import.done', (event) => {
       console.log('import.done >>>>>>',event);
       const {
         error
       } = event;
       if (error) {
         console.log('inside bpmnViewer on error >', error);
         //return handleError(error);
       }
     //  bpmnViewer.get('canvas').zoom('fit-viewport');
       //return handleShown(warnings);
     });
     bpmnViewer.importXML(diagramXML);
   }
   console.log('containerRef current 2>>>>>>',container);
 },[diagramXML,container]);



  /*const handleError = (err) => {
    console.log(err);
    const { onError } = props;
    if (onError) {
      onError(err);
    }
  }

  const handleShown = (warnings)=>{
    const { onShown } = props;
    if (onShown) {
      onShown(warnings);
    }
  }*/

 /* if (isProcessDiagramLoading) {
    return <Loading/>;
  }*/

  return (
    <div>
      <div className="react-bpmn-diagram-container bpm-container" ref={containerRef}/>
    </div>
  );
};

export default ProcessDiagram;

