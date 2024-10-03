import React, { useEffect, useRef, useState } from 'react';
import { Modal, Form, ListGroup, FormControl, InputGroup } from 'react-bootstrap';
import { CopyIcon, InfoIcon, CustomPill, CustomRadioButton, CustomButton, FormInput } from "@formsflow/components";

import { useDispatch, useSelector } from 'react-redux';
import { getUserRoles } from '../../apiManager/services/authorizationService';
import { setUserGroups } from '../../actions/authorizationActions';
import { useTranslation } from 'react-i18next';
import { copyText } from '../../apiManager/services/formatterService';

const SettingsModal = ({ show, handleClose, handleConfirm }) => {
  const { t } = useTranslation();


  const [roleInputEdit, setRoleInputEdit] = useState('');
  const [filteredRolesEdit, setFilteredRolesEdit] = useState([]);
  const [roleInputCreate, setRoleInputCreate] = useState('');
  const [filteredRolesCreate, setFilteredRolesCreate] = useState([]);
  const [roleInputView, setRoleInputView] = useState('');
  const [filteredRolesView, setFilteredRolesView] = useState([]);

  const [userRoles, setUserRoles] = useState([]);
  const [selectedRolesEdit, setSelectedRolesEdit] = useState([]);
  const [selectedRolesCreate, setSelectedRolesCreate] = useState([]);
  const [selectedRolesView, setSelectedRolesView] = useState([]);

  const [selectedOptionEdit, setSelectedOptionEdit] = useState('onlyYou');
  const [selectedOptionCreate, setSelectedOptionCreate] = useState('registeredUsers');
  const [selectedOptionView, setSelectedOptionView] = useState('submitter');
  const [isCreateChecked, setIsCreateChecked] = useState(false);
  const [url, setUrl] = useState('');
  const formName = useSelector((state) => state.form.form.name);
  const formDescription = useSelector((state) => state.process.formProcessList.description);
  const formPath = useSelector((state) => state.form.form.path);
  const dispatch = useDispatch();
  const [copied, setCopied] = useState(false);
  const [newPath, setNewPath] = useState(formPath);
  const [newFormName, setNewFormName] = useState(formName);
  const [NewFormDescription, setNewFormDescription] = useState(formDescription);





  const handleFormNameChange = (e) => {
    setNewFormName(e.target.value);
  };

  const handleFormDescriptionChange = (e) => {
    setNewFormDescription(e.target.value);
  };


  useEffect(() => {
    getUserRoles()
      .then((res) => {
        if (res) {
          setUserRoles(res.data);
          dispatch(setUserGroups(res.data));
        }
      })
      .catch((error) => console.error("error", error));
  }, [dispatch]);

  useEffect(() => {
    const originUrl = window.location.origin;
    const newUrl = `${originUrl}/public/form/${newPath}`;
    setUrl(newUrl);
  }, [newPath]);

  const handleRoleInputChangeEdit = (e) => {
    const inputValue = e.target.value;
    setRoleInputEdit(inputValue);
    setFilteredRolesEdit(userRoles.filter((role) =>
      role.name.toLowerCase().includes(inputValue.toLowerCase())));
  };

  const handleRoleInputChangeCreate = (e) => {
    const inputValue = e.target.value;
    setRoleInputCreate(inputValue);
    setFilteredRolesCreate(userRoles.filter((role) =>
      role.name.toLowerCase().includes(inputValue.toLowerCase())));
  };

  const handleRoleInputChangeView = (e) => {
    const inputValue = e.target.value;
    setRoleInputView(inputValue);
    setFilteredRolesView(userRoles.filter((role) =>
      role.name.toLowerCase().includes(inputValue.toLowerCase())));
  };

  const handleRoleSelect = (role, setSelectedRoles) => {
    setSelectedRoles((prevRoles) =>
      !prevRoles.includes(role.name) ? [...prevRoles, role.name] : prevRoles);
    clearRoleInputs();
  };

  const clearRoleInputs = () => {
    setRoleInputEdit('');
    setRoleInputCreate('');
    setRoleInputView('');
    setFilteredRolesEdit([]);
    setFilteredRolesCreate([]);
    setFilteredRolesView([]);
  };

  const removeRole = (role, setSelectedRoles) => {
    setSelectedRoles((prevRoles) => prevRoles.filter((r) => r !== role));
  };

  const copyPublicUrl = () => {
    copyText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 3000);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleFormPathChange = (e) => {
    setNewPath(e.target.value);
  };

  const dropEditRef = useRef(null);
  const dropCreateRef = useRef(null);
  const dropViewRef = useRef(null);


  const handleClickOutside = (event) => {
    if (dropEditRef.current && !dropEditRef.current.contains(event.target)) {
      setFilteredRolesEdit([]);
    }
    if (dropCreateRef.current && !dropCreateRef.current.contains(event.target)) {
      setFilteredRolesCreate([]);
    }
    if (dropViewRef.current && !dropViewRef.current.contains(event.target)) {
      setFilteredRolesView([]);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  

  return (
    <Modal className="d-flex flex-column align-items-start w-100 mt-5 mb-5 settings-modal" show={show} onHide={handleClose} dialogClassName="modal-50w" backdrop="static" >
      <Modal.Header>
        <Modal.Title>{t("Settings")}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        {/* Section 1: Basic */}
        <div className='section'>
          <h5 className='fw-bold'>{t("Basic")}</h5>
          <FormInput value={newFormName} label={t("Name")} onChange={handleFormNameChange} dataTestid="form-name" ariaLabel={t("Form Name")} />

          <Form.Group className='settings-input' controlId="descriptionInput">
            <Form.Label className='field-label'>{t("Description")}</Form.Label>
            <Form.Control className='text-area' as="textarea" rows={3} value={NewFormDescription} onChange={handleFormDescriptionChange} dataTestid="form-description" ariaLabel={t("Form Description")} />
          </Form.Group>
        </div>

        <hr className='modal-hr' />

        <div className="section">
          <h5 className='fw-bold'>{t("Permissions")}</h5>

          <Form.Label className='field-label'>{t("Who Can Edit This Form")}</Form.Label>
          <CustomRadioButton items={[
            { label: t("Only You"), onClick: () => setSelectedOptionEdit('onlyYou') },
            { label: t("You and specified roles"), onClick: () => setSelectedOptionEdit('specifiedRoles') },
          ]} dataTestid="edit-submission-role" ariaLabel={t("Edit Submission Role")} />

          {selectedOptionEdit === 'onlyYou' && (
            <FormInput disabled="true" />
          )}
          {selectedOptionEdit === 'specifiedRoles' && (
            <>
              <div className='w-100'>
                <div className="input-with-pills form-control cursor-pointer position-relative">
                  {selectedRolesEdit.map((role, index) => (
                    <CustomPill key={index} label={role} icon={true} bg="primary" onClick={() => removeRole(role, setSelectedRolesEdit)} />
                  ))}
                  <input type="text" value={roleInputEdit} onChange={handleRoleInputChangeEdit} className="role-input" />
                </div>
              

              {filteredRolesEdit.length > 0 && (
                <div className="input-drop-edit cursor-pointer w-70" ref={dropEditRef}>
                  <ListGroup>
                    {filteredRolesEdit.map((role) => (
                      <ListGroup.Item key={role.id} onClick={() =>
                        handleRoleSelect(role, setSelectedRolesEdit)}>
                        {role.name}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
              )}
              </div>
            </>
          )}

          <Form.Label className='field-label mt-3'>{t("Who Can Create Submissions")}</Form.Label>
          <Form.Check
            type="checkbox"
            id="createCheckbox"
            label={t("Anonymous users")}
            checked={isCreateChecked}
            onChange={() => setIsCreateChecked(!isCreateChecked)}
            className='field-label'
          />
          <CustomRadioButton items={[
            { label: t("Registered users"), onClick: () => setSelectedOptionCreate('registeredUsers') },
            { label: t("Specific roles"), onClick: () => setSelectedOptionCreate('specificRoles') },
          ]} dataTestid="create-submission-role" ariaLabel={t("Create Submission Role")} />
          {selectedOptionCreate === 'registeredUsers' && (
            <FormInput disabled="true" />
          )}
          {selectedOptionCreate === 'specificRoles' && (
            <>
              <div className="w-100">
                <div className="input-with-pills form-control cursor-pointer position-relative">
                  {selectedRolesCreate.map((role, index) => (
                    <CustomPill key={index} label={role} icon={true} bg="primary" onClick={() => removeRole(role, setSelectedRolesCreate)} />
                  ))}
                  <input type="text" value={roleInputCreate} onChange={handleRoleInputChangeCreate} className="role-input" />
                </div>
              

              {filteredRolesCreate.length > 0 && (
                <div className="input-drop-create cursor-pointer w-70" ref={dropCreateRef}>
                  <ListGroup>
                    {filteredRolesCreate.map((role) => (
                      <ListGroup.Item key={role.id} onClick={() =>
                        handleRoleSelect(role, setSelectedRolesCreate)}>
                        {role.name}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
              )}
              </div>
            </>
          )}

          <Form.Label className='field-label mt-3'>{t("Who Can View Submissions")}</Form.Label>
          <CustomRadioButton items={[
            { label: t("Submitter"), onClick: () => setSelectedOptionView('submitter') },
            { label: t("Submitter and specified roles"), onClick: () => setSelectedOptionView('specifiedRoles') },
          ]} dataTestid="view-submission-role" ariaLabel={t("View Submission Role")} />
          {selectedOptionView === 'submitter' && (
            <FormInput disabled="true" />
          )}
          {selectedOptionView === 'specifiedRoles' && (
            <>
              <div className="w-100">
                <div className="input-with-pills form-control cursor-pointer position-relative ">
                  {selectedRolesView.map((role, index) => (
                    <CustomPill key={index} label={role} icon={true} bg="primary" onClick={() => removeRole(role, setSelectedRolesView)} />
                  ))}
                  <input type="text" value={roleInputView} onChange={handleRoleInputChangeView} className="role-input" />
                </div>
              

              {filteredRolesView.length > 0 && (
                <div className="input-drop-view cursor-pointer w-70" ref={dropViewRef}>
                  <ListGroup>
                    {filteredRolesView.map((role) => (
                      <ListGroup.Item key={role.id} onClick={() =>
                        handleRoleSelect(role, setSelectedRolesView)}>
                        {role.name}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
              )}
              </div>
            </>
          )}
        </div>

        <hr className='modal-hr' />

        <div className="section">
          <h5 className='fw-bold'>{t("Link for this form")}</h5>
          <div className="info-panel">
            <div className='d-flex align-items-center'>
              <InfoIcon />
              <div className='field-label ms-2'>{t("Note")}</div>
            </div>
            <div className='info-content'>
              {t("Making changes to your form URL will make your form inaccessible from your current URL.")}
            </div>
          </div>
          <Form.Group className='settings-input' controlId="url-input">
            <Form.Label className='field-label'>{t("URL Path")}</Form.Label>
            <InputGroup className='url-input'>
              <InputGroup.Text className='url-non-edit'>
                {`${window.location.origin}/public/form/`}
              </InputGroup.Text>

              <FormControl
                type="text"
                value={newPath}
                className='url-edit'
                onChange={handleFormPathChange}
              />
              <InputGroup.Text className='url-copy' onClick={copyPublicUrl}>
                {copied ? <i className="fa fa-check" /> : <CopyIcon />}
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>





        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-start">
        <CustomButton
          variant="primary"
          size="md"
          label={t("Save Changes")}
          onClick={handleConfirm}
          dataTestid="save-form-settings"
          ariaLabel={t("Save Form Settings")}
        />

        <CustomButton
          variant="secondary"
          size="md"
          label={t("Discard Changes")}
          onClick={handleClose}
          dataTestid="cancel-form-settings"
          ariaLabel={t("Cancel Form Settings")}
        />
      </Modal.Footer>
    </Modal>
  );
};

export default SettingsModal;
