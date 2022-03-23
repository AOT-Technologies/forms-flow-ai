import React, {useCallback, useEffect, useState} from 'react';
import {useDispatch,useSelector} from "react-redux";

import BpmnJS from 'bpmn-js/dist/bpmn-navigated-viewer.production.min.js';
import Loading from "../../containers/Loading";
import {fetchDiagram, getProcessActivities} from "../../apiManager/services/processServices";
import {setProcessActivityData, setProcessDiagramLoading, setProcessDiagramXML} from "../../actions/processActions";
import "./bpm.scss"
//import BpmnJS from 'bpmn-js';
import usePrevious from "./UsePrevious";
import Nodata from "../Nodata";
import { useTranslation } from "react-i18next";
const ProcessDiagram = React.memo((props)=>{
  const {t}=useTranslation();
  const process_key = props.process_key;
  const processInstanceId = props.processInstanceId;
  const dispatch= useDispatch();
  const isProcessDiagramLoading = useSelector(state=>state.process.isProcessDiagramLoading);
  const diagramXML = useSelector(state => state.process.processDiagramXML);
  const markers =  useSelector(state => state.process.processActivityList);
  const prevMarkers = usePrevious(markers);
  const [bpmnViewer, setBpmnViewer] = useState(null);

  const containerRef = useCallback(node => {
    if (node !== null) {
      setBpmnViewer(new BpmnJS({ container:"#process-diagram-container" }));
    }
  }, []);

  useEffect(()=>{
    if(bpmnViewer){
      bpmnViewer.on('import.done', (event) => {
        const {
          error
        } = event;
        if (error) {
          console.log('bpmnViewer error >', error);
          //return handleError(error);
        }
        //bpmnViewer.get('canvas').zoom('fit-viewport');
        //return handleShown(warnings);
      });
    }
    return ()=>{
      bpmnViewer && bpmnViewer.destroy();
    }
  },[bpmnViewer])


  useEffect(()=>{
    if(process_key){
      dispatch(setProcessDiagramLoading(true));
      dispatch(fetchDiagram(process_key));
    }
    else
    {
      dispatch(setProcessDiagramLoading(false));
    }
    return ()=>{
      dispatch(setProcessDiagramLoading(true));
      dispatch(setProcessDiagramXML(""));
    }
  },[process_key,dispatch])

  useEffect(()=>{
    if(processInstanceId){
      dispatch(getProcessActivities(processInstanceId));
    }
    return ()=>{
      dispatch(setProcessActivityData(null));
    }
  },[processInstanceId,dispatch])


 useEffect(()=>{
   if(diagramXML && bpmnViewer) {
     bpmnViewer.importXML(diagramXML);
   }
 },[diagramXML,bpmnViewer])

  useEffect(()=> {
    if(diagramXML && bpmnViewer && markers && markers[0]) {
        let marker = markers;
      if ((!prevMarkers || (prevMarkers[0] && markers[0].id === prevMarkers[0].id))&& marker!=null){
          setTimeout(() => {
            bpmnViewer && bpmnViewer.get('canvas') &&
            bpmnViewer.get('canvas').addMarker({'id':markers[0].activityId}, 'highlight');
          },0);
      }
   }
 },[diagramXML,bpmnViewer,markers,prevMarkers]);
 
 const zoom = () => {
  bpmnViewer.get('zoomScroll').stepZoom(1)
  }

  const zoomOut = () => {
    bpmnViewer.get('zoomScroll').stepZoom(-1)
    }
  const zoomReset = ()=>{ bpmnViewer.get('zoomScroll').reset();}
    
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
  
  
  // if(processInstanceId === null && isProcessDiagramLoading === false)
  // { 
  //   return <div className="bpmn-viewer-container">
  //     <div className="bpm-container">
  //       <Nodata text={"No Process Diagram found"} className={"div-no-application-list text-center"}/>
  //     </div>
  //   </div>
  // }


  // if(processInstanceId === null && isProcessDiagramLoading === false)
  // {
  //   return <div className="bpmn-viewer-container">
  //     <div className="bpm-container">
  //       <Nodata text={"No Process Diagram found"} className={"div-no-application-list text-center"}/>
  //     </div>
  //   </div>
  // }

  if (isProcessDiagramLoading) {
    return <div className="bpmn-viewer-container">
      <div className="bpm-container">
      <Loading/>
      </div>
    </div>
  }
  if( diagramXML=== ""){
    return <div className="bpmn-viewer-container">
      <div className="bpm-container">
        <Nodata text={t("No Process Diagram found")} className={"div-no-application-list text-center"}/>
      </div>
    </div>
  }
  
  return (
    <>
    <div className="bpmn-viewer-container">
      <div id="process-diagram-container" className="bpm-container grab-cursor" ref={containerRef}/>
    </div >
    <div className="d-flex  justify-content-end btn_zoom">
      <div className="d-flex flex-column">
    <button className='mb-3' title='Reset Zoom' onClick={()=>zoomReset()}>
     <i class="fa fa-retweet" aria-hidden="true"></i> 
    {/* <i className="icon-screenshot"></i> */}
   </button> 
    <button  title='Zoom In' onClick={()=>zoom()}>
    <i class="fa fa-search-plus" aria-hidden="true"></i>
    {/* <i className="fa fa-plus" aria-hidden="true"></i> */}
   </button>
   <button title='Zoom Out' onClick={()=>zoomOut()}>
   <i class="fa fa-search-minus" aria-hidden="true"></i>
    {/* <i className="fa fa-minus" aria-hidden="true"></i> */}
  </button>
  </div>
    </div>
    </>
  );
});

export default ProcessDiagram;