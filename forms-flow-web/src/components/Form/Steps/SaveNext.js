import React,{useState} from "react";
import Buttons from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useSelector } from "react-redux";
const SaveNext = React.memo(({ handleNext, handleBack, activeStep, isLastStep, submitData,modified }) => {
  const applicationCount = useSelector((state) =>state.process.applicationCount)
  const handleChanges = ()=>{
   if( applicationCount > 0){
    if(modified){
      handleShow()
    }else if(!isLastStep){
      handleNext()
    }else{
      submitData()
    }
   }else{
    !isLastStep? handleNext() : submitData()
   }
   
  }
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  
  return (
    <>
      <Buttons className="mx-2" variant="outline-secondary" disabled={activeStep === 0} onClick={handleBack}>
        Back
      </Buttons>
      <Buttons
        variant="primary"
        onClick={handleChanges}
      >
        {isLastStep ? "Save" : "Next"}
      </Buttons>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Changing the form workflow will not affect the existing applications. It will only update in the newly created applications. Press Save Changes to continue or cancel the changes.</Modal.Body>
        <Modal.Footer>
          <Buttons variant="secondary" onClick={handleClose}>
            Cancel
          </Buttons>
          <Buttons variant="primary" onClick={!isLastStep? handleNext:submitData}>
            Save Changes
          </Buttons>
        </Modal.Footer>
      </Modal>
    </>
  );
});
export default SaveNext;
