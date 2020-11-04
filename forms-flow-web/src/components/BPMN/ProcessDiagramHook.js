
import React, {useRef, useEffect} from 'react';
import {useDispatch,useSelector} from "react-redux";
import {useParams} from "react-router-dom";
// import BpmnJS from 'bpmn-js/dist/bpmn-navigated-viewer.production.min.js';
import Loading from "../../containers/Loading";

import {fetchDiagram} from "../../apiManager/services/processServices";
import {setProcessDiagramLoading} from "../../actions/processActions";
import "./bpm.scss"
import BpmnJS from 'bpmn-js';

const ProcessDiagram = (props)=>{
  const process_key = props.process_key;
  console.log("start",process_key);
  const containerRef = useRef(null);
  console.log('containerRef current>>>>>>',containerRef.current);
  console.log('containerRef >>>>>>',containerRef);
  const dispatch= useDispatch();
  const isProcessDiagramLoading = useSelector(state=>state.process.isProcessDiagramLoading);
  const diagramXML = useSelector(state => state.process.processDiagramXML);

  const container = containerRef.current;
  const bpmnViewer = new BpmnJS({ container });
  console.log('container >>>>>>',container);



  useEffect(()=>{
    dispatch(setProcessDiagramLoading(true));
    // console.log('process_key >>',process_key);
    if(process_key){
      dispatch(fetchDiagram(process_key));
      //console.log('diagramXML >>',diagramXML);
    }
  },[process_key,dispatch])

 useEffect(()=>{
   console.log('diagramXML >>',diagramXML)
   const displayDiagram = (diagramXML)=>{
     console.log('container 3>>>>>>',container);
     // console.log('diagramXML >>>>>>',diagramXML);

     bpmnViewer.on('import.done', (event) => {
       console.log('import.done >>>>>>',event);
       const {
         error,
         warnings
       } = event;
       if (error) {
         console.log('inside bpmnViewer on error >', error);
         //return handleError(error);
       }
       bpmnViewer.get('canvas').zoom('fit-viewport');
       //return handleShown(warnings);
     });
     bpmnViewer.importXML(diagramXML);
   }
   if(diagramXML){
     displayDiagram(diagramXML);
   }
   console.log('containerRef current 2>>>>>>',containerRef.current);
 },[diagramXML,bpmnViewer, container]);



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

  if (isProcessDiagramLoading) {
    return <Loading/>;
  }

  return (
    <div> abcd

    <div className="react-bpmn-diagram-container bpm-container" ref={containerRef}/>
    </div>
  );

};

export default ProcessDiagram;

