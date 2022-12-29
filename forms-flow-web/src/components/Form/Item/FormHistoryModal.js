import React, { useEffect, useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { setRestoreFormId } from '../../../actions/formActions';
import { getLocalDateTime } from '../../../apiManager/services/formatterService';

const FormHistoryModal = ({historyModal,formHistory,
    handleModalChange, gotoEdit}) => {
        const [showCount, setShowCount] = useState(3);
        const [sliceFormHistory,setSliceFormHistory] = useState([]);
        const historyRef = useRef(null);
        
        const setAndRestCount = () =>{
            setShowCount(formHistory.length <= 3 ? formHistory.length : 3);
        };

        useEffect(()=>{
            setAndRestCount();
        },[formHistory]);
     
        useEffect(()=>{
            setSliceFormHistory(formHistory.slice(0,showCount)); 
        },[showCount]);

        useEffect(()=>{
            historyRef?.current?.lastElementChild.scrollIntoView({
                behavior: "smooth"
              });
        },[sliceFormHistory]);
 
  const handleShowMore = () =>{
    if(showCount + 3 <= formHistory.length){
        setShowCount(showCount + 3);
    }else{
        setShowCount(formHistory.length);  
    }
  };
  
  const dispatch = useDispatch();
  const selectHistory = (cloneId) =>{
    dispatch(setRestoreFormId(cloneId));
    gotoEdit();
  };
  return (
    <>
     <Modal
          show={historyModal}
          size="lg"
          aria-labelledby="example-custom-modal-styling-title"
        >
          <Modal.Header>
            <div>
              <Modal.Title id="example-custom-modal-styling-title">
                Form History
              </Modal.Title>
            </div>

            <div>
              <button
                type="button"
                className="close"
                onClick={() => {
                  handleModalChange();
                  setAndRestCount();
                }}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          </Modal.Header>

          <Modal.Body>
            <div className="d-flex align-items-start p-3">
              <i className="fa fa-info-circle text-primary mr-2"></i>
              <span className="text-muted h6">
              Formsflow automatically saves your previous form data. 
              Now you can switch to the previous stage and edit.
              </span>
            </div>
            {sliceFormHistory.length ? (
             <>
              <ul className="form-history-container" ref={historyRef} >
                {sliceFormHistory.map((i, index) => (
                  <li key={index}>
                    <div
                      className={`d-flex justify-content-between history-details ${
                        index === 0 ? "active" : ""
                      }`}
                    >
                      <div>
                        <span className="text-muted text-small">
                          {formHistory.length === 1
                            ? "Created by"
                            : "Modified by"}
                        </span>
                        <span className="d-block">{i.createdBy}</span>
                      </div>
                      <div>
                        <span className="text-muted">
                          {formHistory.length === 1
                            ? "Created on"
                            : "Modified on"}
                        </span>
                        <p>{getLocalDateTime(i.created)}</p>
                      </div>
                      <div>
                        <span className="d-block text-muted">Action </span>
                        <button
                          className="btn btn-outline-primary"
                          disabled={index === 0}
                          onClick={() => selectHistory(i.changeLog.cloned_form_id) }
                        >
                          <i className="fa fa-pencil" aria-hidden="true" />
                          &nbsp;&nbsp; Edit
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {
                formHistory.length > showCount && (
                <div className='d-flex justify-content-center'>
              <button className='btn btn-outline-primary' onClick={()=>{handleShowMore();}}>
              Show more
              <i className="fa fa-arrow-circle-down ml-2" aria-hidden="true"></i> 
              </button>
           </div>
                )
              }
           </>

            ) : (
              <p>No histories found</p>
            )}
          </Modal.Body>
        </Modal>
    </>
  );
};

export default FormHistoryModal;