import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBundleSelectedForms } from "../../../actions/bundleActions";
import FormListModal from "./FormListModal";
import SelectedFormTable from "./SelectedForms";

const FormSelect = React.memo(() => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const selectedForms = useSelector(
    (state) => state.bundle?.selectedForms || []
  );

  const handleModalChange = () => {
    setShowModal(!showModal);
  };

  const submitFormSelect = (forms) => {
    dispatch(setBundleSelectedForms(forms));
    setShowModal(false);
  };

  const deleteForm = (mapperId) => {
    const filteredForms = selectedForms?.filter((i) => i.mapperId !== mapperId);
    dispatch(setBundleSelectedForms(filteredForms));
  };

  return (
    <div>
      <SelectedFormTable
        handleModalChange={handleModalChange}
        deleteForm={deleteForm}
        selectedForms={selectedForms}
      />
      <FormListModal
        handleModalChange={handleModalChange}
        submitFormSelect={submitFormSelect}
        formsAlreadySelected={selectedForms}
        showModal={showModal}
      />
    </div>
  );
});

export default FormSelect;
