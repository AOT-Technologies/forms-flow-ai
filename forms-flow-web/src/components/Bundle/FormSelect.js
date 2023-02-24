import React, { useState } from 'react';
import FormListModal from './FormListModal';
import SelectedFormTable from './SelectedForms';

const FormSelect = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedForms, setSelectedForms] = useState([]);

    const handleModalChange = ()=>{
        setShowModal(!showModal);
    };

    const submitFormSelect = (forms) =>{
        setSelectedForms(forms);
        setShowModal(false);
    };

  return (
    <div>
        <SelectedFormTable handleModalChange={handleModalChange} selectedForms={selectedForms}/>
        <FormListModal handleModalChange={handleModalChange} 
        submitFormSelect={submitFormSelect} showModal={showModal}/>
    </div>
  );
};

export default FormSelect;