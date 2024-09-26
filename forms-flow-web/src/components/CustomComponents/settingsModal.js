import React, { useEffect, useState } from 'react';
import { Modal,  Form, InputGroup, FormControl, Tooltip, OverlayTrigger, ListGroup } from 'react-bootstrap';
import "./settingsModal.scss";
import { CopyIcon, InfoIcon, CustomPill, CustomRadioButton, CustomButton } from "@formsflow/components";

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

  return (
    <Modal className="settingsModal" show={show} onHide={handleClose} dialogClassName="modal-50w" backdrop="static" >
      <Modal.Header>
        <Modal.Title className='modalTitle'>{t("Settings")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Section 1: Basic */}
        <div className='section'>
          <h5 className='basicTitle'>{t("Basic")}</h5>
          <Form.Group className="settingsInput" controlId="nameInput">
            <Form.Label className='fieldLabel'>{t("Name")}</Form.Label>
            <Form.Control className='textField' type="text" value={newFormName} onChange={handleFormNameChange}/>
            
          </Form.Group>
          <Form.Group className='settingsInput' controlId="descriptionInput">
            <Form.Label className='fieldLabel'>{t("Description")}</Form.Label>
            <Form.Control className='textArea' as="textarea" rows={3} value={NewFormDescription}  onChange={handleFormDescriptionChange}/>
          </Form.Group>
        </div>

        <hr className='modalhr' />

        {/* Section 2: Permission */}
        <div className="section">
          <h5 className='secTitle'>{t("Permissions")}</h5>

          {/* Who can edit */}
          <Form.Label className='fieldLabel'>{t("Who Can Edit This Form")}</Form.Label>
            <CustomRadioButton items={[
              { label: t("Only You"), onClick: () => setSelectedOptionEdit('onlyYou') },
              { label: t("You and specified roles"), onClick: () => setSelectedOptionEdit('specifiedRoles') },
            ]} />
          
          {selectedOptionEdit === 'onlyYou' && (
            <Form.Control className='disabledInput' disabled />
          )}
          {selectedOptionEdit === 'specifiedRoles' && (
            <>
              <div className="inputWithPills form-control">
                {selectedRolesEdit.map((role, index) => (
                  <CustomPill
                    key={index}
                    label={role}
                    icon={true}
                    bg="primary"
                    onClick={() => removeRole(role, setSelectedRolesEdit)}
                  />
                ))}
                <input
                  type="text"
                  value={roleInputEdit}
                  onChange={handleRoleInputChangeEdit}
                  className="roleInput"
                />
              </div>
              {filteredRolesEdit.length > 0 && (
                <div className='input-drop-edit cursor-pointer'>
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
            </>
          )}

          {/* Who can create */}
          <Form.Label className='fieldLabel'>{t("Who Can Create Submissions")}</Form.Label>
          <Form.Check 
            type="checkbox" 
            id="createCheckbox" 
            label={t("Anonymous users")} 
            checked={isCreateChecked} 
            onChange={() => setIsCreateChecked(!isCreateChecked)} 
            className='fieldLabel'
          />
            <CustomRadioButton items={[
              { label: t("Registered users"), onClick: () => setSelectedOptionCreate('registeredUsers') },
              { label: t("Specific roles"), onClick: () => setSelectedOptionCreate('specificRoles') },
            ]} />
          {selectedOptionCreate === 'registeredUsers' && (
            <Form.Control className='disabledInput' disabled />
          )}
          {selectedOptionCreate === 'specificRoles' && (
            <>
              <div className="inputWithPills form-control">
                {selectedRolesCreate.map((role, index) => (
                  <CustomPill
                    key={index}
                    label={role}
                    icon={true}
                    bg="primary"
                    onClick={() => removeRole(role, setSelectedRolesCreate)}
                  />
                ))}
                <input
                  type="text"
                  value={roleInputCreate}
                  onChange={handleRoleInputChangeCreate}
                  className="roleInput"
                />
              </div>
              {filteredRolesCreate.length > 0 && (
                <div className='input-drop-create  cursor-pointer'>
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
            </>
          )}

          {/* Who can view */}
          <Form.Label className='fieldLabel'>{t("Who Can View Submissions")}</Form.Label>
            <CustomRadioButton items={[
              { label: t("Submitter"), onClick: () => setSelectedOptionView('submitter') },
              { label: t("Submitter and specified roles"), onClick: () => setSelectedOptionView('specifiedRoles') },
            ]} />
          {selectedOptionView === 'submitter' && (
            <Form.Control className='disabledInput' disabled />
          )}
          {selectedOptionView === 'specifiedRoles' && (
            <>
              <div className="inputWithPills form-control">
                {selectedRolesView.map((role, index) => (
                  <CustomPill
                    key={index}
                    label={role}
                    icon={true}
                    bg="primary"
                    onClick={() => removeRole(role, setSelectedRolesView)}
                  />
                ))}
                <input
                  type="text"
                  value={roleInputView}
                  onChange={handleRoleInputChangeView}
                  className="roleInput"
                />
              </div>
              {filteredRolesView.length > 0 && (
                <div className='input-drop-view cursor-pointer'>
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
            </>
          )}
        </div>

        <hr className='modalhr' />

        {/* Section 3: Link */}
        <div className="section">
        <h5 className='secTitle'>{t("Link for this form")}</h5>
          <div className="noteSection">
            <div className='d-flex align-items-center'>
              <InfoIcon />
              <div className='fieldLabel ms-2'>{t("Note")}</div>
            </div>
            <div className='noteContent'>
              {t("Making changes to your form URL will make your form inaccessible from your current URL.")}
            </div>
          </div>
          <Form.Group className='settingsInput' controlId="urlInput">
            <Form.Label className='fieldLabel'>{t("URL Path")}</Form.Label>
            <InputGroup className='urlInput'>
        {/* Static */}
        <InputGroup.Text className='urlNonEditField'>
          {`${window.location.origin}/public/form/`}
        </InputGroup.Text>

        {/* Editable*/}
        <FormControl
          type="text"
          value={newPath}
          className='editableField'
          onChange={handleFormPathChange}
          />
              <OverlayTrigger overlay={<Tooltip>{t("Copy")}</Tooltip>}>
                <InputGroup.Text className='copySec' onClick={copyPublicUrl}>
                {copied ? <i className="fa fa-check" /> : <CopyIcon />}
                </InputGroup.Text>
              </OverlayTrigger>
            </InputGroup>
          </Form.Group>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className='footerButtons'>
          <CustomButton  
          variant="primary" 
          size="md" 
          label={ t("Save Changes")}
          onClick={handleConfirm}
          dataTestid="save-form-settings"
          ariaLabel={t("Save Form Settings")}
          />
             
          <CustomButton  
          variant="secondary" 
          size="md" 
          label={ t("Discard Changes")}
          onClick={handleClose}
          dataTestid="cancel-form-settings"
          ariaLabel={t("Cancel Form Settings")}
          />
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default SettingsModal;
