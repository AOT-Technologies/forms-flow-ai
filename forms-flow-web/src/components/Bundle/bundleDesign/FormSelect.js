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

    const deleteForm = (formId) =>{
      setSelectedForms((prev)=> prev.filter(form => form.id !== formId));
    };

  return (
    <div>
        <SelectedFormTable handleModalChange={handleModalChange}
        deleteForm={deleteForm} selectedForms={selectedForms}/>
        <FormListModal handleModalChange={handleModalChange} 
        submitFormSelect={submitFormSelect} 
        formsAlreadySelected={selectedForms}
        setSelectedForms={setSelectedForms} showModal={showModal}/>
    </div>
  );
};

export default FormSelect;