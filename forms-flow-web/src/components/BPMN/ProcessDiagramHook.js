
import React, {useCallback, useEffect, useState} from 'react';
import {useDispatch,useSelector} from "react-redux";

import BpmnJS from 'bpmn-js/dist/bpmn-navigated-viewer.production.min.js';
import Loading from "../../containers/Loading";

import {fetchDiagram, getProcessActivities} from "../../apiManager/services/processServices";
import {setProcessDiagramLoading} from "../../actions/processActions";
import "./bpm.scss"
//import BpmnJS from 'bpmn-js';
import usePrevious from "./UsePrevious";

const ProcessDiagram = React.memo((props)=>{
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
    dispatch(setProcessDiagramLoading(true));
    if(process_key){
      dispatch(fetchDiagram(process_key));
    }
  },[process_key,dispatch])

  useEffect(()=>{
    if(processInstanceId){
      dispatch(getProcessActivities(processInstanceId));
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
        marker = marker.replace(/'/g, '"');
        const markerJson = JSON.parse(marker);
      if ((!prevMarkers || (prevMarkers[0] && markers[0].id === prevMarkers[0].id))&& marker!=null){
        for (let i=0; i < markerJson.length; i++) {
          setTimeout(() => {
            bpmnViewer && bpmnViewer.get('canvas') &&
            bpmnViewer.get('canvas').addMarker({'id':markerJson[i].activityId}, 'highlight');
          },0);
        }
      }
   }
 },[diagramXML,bpmnViewer,markers,prevMarkers]);



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
    return <div className="bpmn-viewer-container">
      <div className="bpm-container">
      <Loading/>
      </div>
    </div>
  }

  return (
    <div className="bpmn-viewer-container">
      <div id="process-diagram-container" className="bpm-container grab-cursor" ref={containerRef}/>
    </div>
  );
});

export default ProcessDiagram;

