/*
import React, {useRef, useEffect, useState} from 'react'
import BpmnJS from 'bpmn-js/dist/bpmn-navigated-viewer.production.min.js';

import UserService from "../../services/UserService";
import API from "../../apiManager/endpoints";
import "./bpm.scss"


const ProcessDiagram = (props) => {
  const containerRef = useRef();

  const {
    process_key
  } = props;

  const container = containerRef.current;

  const bpmnViewer = new BpmnJS({ container });
  const [diagramXML, setDiagramXML]= useState();

  bpmnViewer.on('import.done', (event) => {
    const {
      error,
      warnings
    } = event;
    if (error) {
      return handleError(error);
    }
    bpmnViewer.get('canvas').zoom('fit-viewport');
    return handleShown(warnings);
  });


  useEffect(()=>{
    if(process_key){
      fetchDiagram(process_key)
    }
  },[process_key])

  useEffect(()=>{
    displayDiagram(diagramXML)
  },[diagramXML]);

  const displayDiagram = (diagramXML)=>{
    bpmnViewer.importXML(diagramXML);
  }

  const fetchDiagram = (process_key) => {
    const url =API.PROCESSES+'/'+process_key+'/xml';
    handleLoading();
    fetch(url, {
      method: 'get',
      headers: new Headers({
        'Authorization': 'Bearer '+UserService.getToken()
      })})
      .then(res => res.json())
      .then(resJson => setDiagramXML(resJson.bpmn20Xml))
      .catch(err => handleError(err));
  }

  const handleLoading = ()=>{
    const { onLoading } = props;
    if (onLoading) {
      onLoading();
    }
  }

  const handleError = (err) => {
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
  }

  return (
    <div className="react-bpmn-diagram-container bpm-container" ref={containerRef }/>
  );

};

export default ProcessDiagram;
*/
