import React, { useState } from 'react';
import FormListModal from './FormListModal';
import SelectedForms from './SelectedForms';

const FormSelect = () => {
    const [showModal, setShowModal] = useState(false);

    const handleModalChange = ()=>{
        setShowModal(!showModal);
    };
  return (
    <div>
        <SelectedForms handleModalChange={handleModalChange}/>
        <FormListModal handleModalChange={handleModalChange} showModal={showModal}/>
    </div>
  );
};

export default FormSelect;