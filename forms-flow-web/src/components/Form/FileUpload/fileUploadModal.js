import React, {useEffect, useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ProgressBar from 'react-bootstrap/ProgressBar'
import {useSelector} from "react-redux";
import Spinner from 'react-bootstrap/Spinner';
import {Translation,useTranslation} from "react-i18next";


const FileModal= React.memo(({modalOpen=false, onClose,forms})=> {
    const formUploadList = useSelector(state => state.formCheckList.formUploadFormList);
    const formUploadCounter = useSelector(state => state.formCheckList.formUploadCounter);
    const [formsUploaded, setFormsUploaded] = useState(0);
    const {t}=useTranslation();

    useEffect(()=>{
      if(formUploadList.length){
        setFormsUploaded((formUploadCounter/formUploadList.length)*100);
      }
    },[formUploadCounter,formUploadList]);
    return (
      <>
          <Modal show={modalOpen} onHide={onClose}>
              <Modal.Header>
                 <Modal.Title><b><Translation>{(t)=>t("file_upload_confirmation")}</Translation>)</b></Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div>{`${formUploadCounter}/${formUploadList.length} ${t("forms_completed")}`} {(formUploadList.length!==formUploadCounter)?<Spinner animation="border" variant="primary" />:""}</div>
                {formUploadList.length?<ProgressBar now={formsUploaded} label={`${formsUploaded}%`} />
                  : <div><Translation>{(t)=>t("no_forms_found")}</Translation></div>}
              </Modal.Body>
              <Modal.Footer>
              <Button type="button" className="btn btn-default" onClick={onClose}><Translation>{(t)=>t("Close")}</Translation></Button>
              </Modal.Footer>
          </Modal>
        </>
    )
});

export default FileModal;
