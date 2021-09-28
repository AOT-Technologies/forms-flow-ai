import React, {useEffect, useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ProgressBar from 'react-bootstrap/ProgressBar'
import {useSelector} from "react-redux";
import Spinner from 'react-bootstrap/Spinner'

const Filemodel= React.memo(({modalOpen=false, onClose,forms})=> {
    const formUploadList = useSelector(state => state.formCheckList.formUploadFormList);
    const formUploadCounter = useSelector(state => state.formCheckList.formUploadCounter);
    const [formsUploaded, setFormsUploaded] = useState(0);

    useEffect(()=>{
      if(formUploadList.length){
        setFormsUploaded((formUploadCounter/formUploadList.length)*100);
      }
    },[formUploadCounter,formUploadList]);
   
  
    return (
      <>
          <Modal show={modalOpen} onHide={onClose}>
              <Modal.Header>
                 <Modal.Title><b>Forms Upload Confirmation</b></Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p>{`${formUploadCounter}/${formUploadList.length} Forms  completed`} {(formUploadList.length!==formUploadCounter)?<Spinner animation="border" variant="primary" />:""}</p>
                {formUploadList.length?<ProgressBar now={formsUploaded} label={`${formsUploaded}%`} />
                  : <div>No forms found</div>}
              </Modal.Body>
              <Modal.Footer>
              <Button type="button" className="btn btn-default" onClick={onClose}>Close</Button>
              </Modal.Footer>
          </Modal>
        </>
    )
});

export default Filemodel;
