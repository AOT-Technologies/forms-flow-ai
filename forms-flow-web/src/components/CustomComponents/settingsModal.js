import React, { useEffect, useRef, useState, useReducer } from 'react';
import { Modal, Form, ListGroup, FormControl, InputGroup } from 'react-bootstrap';
import { CopyIcon, InfoIcon, CustomPill, CustomRadioButton, CustomButton, FormInput, FormTextArea } from "@formsflow/components";

import { useDispatch, useSelector } from 'react-redux';
import { getUserRoles } from '../../apiManager/services/authorizationService';
import { setUserGroups } from '../../actions/authorizationActions';
import { useTranslation } from 'react-i18next';
import { copyText } from '../../apiManager/services/formatterService';
import _set from "lodash/set";
import _cloneDeep from "lodash/cloneDeep";
import _camelCase from "lodash/camelCase";

const SettingsModal = ({ show, handleClose, handleConfirm }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [rolesState, setRolesState] = useState({
    edit: {
      roleInput: '',
      filteredRoles: [],
      selectedRoles: [],
      selectedOption: 'onlyYou',
    },
    create: {
      roleInput: '',
      filteredRoles: [],
      selectedRoles: [],
      selectedOption: 'registeredUsers',
      isChecked: false,
    },
    view: {
      roleInput: '',
      filteredRoles: [],
      selectedRoles: [],
      selectedOption: 'submitter',
    },
  });

  const [userRoles, setUserRoles] = useState([]);
  const [url, setUrl] = useState('');
  const formName = useSelector((state) => state.form.form.name);
  const formDescription = useSelector((state) => state.process.formProcessList.description);
  const formPath = useSelector((state) => state.form.form.path);

  const [copied, setCopied] = useState(false);
  const [newPath, setNewPath] = useState(formPath);
  const [newFormName, setNewFormName] = useState(formName);
  const [newFormDescription, setNewFormDescription] = useState(formDescription);
  const formData = useSelector((state) => state.form?.form);
  const reducer = (form, { type, value }) => {
    const formCopy = _cloneDeep(form);
    switch (type) {
      case "formChange":
        for (let prop in value) {
          if (Object.prototype.hasOwnProperty.call(value, prop)) {
            form[prop] = value[prop];
          }
        }
        return form;
      case "replaceForm":
        return _cloneDeep(value);
      case "title":
        if (type === "title" && !form._id) {
          formCopy.name = _camelCase(value);
          formCopy.path = _camelCase(value).toLowerCase();
        }
        break;
      default:
        break;
    }
    _set(formCopy, type, value);
    return formCopy;
  };
  const [form, dispatchFormAction] = useReducer(reducer, _cloneDeep(formData));

  const dropEditRef = useRef(null);
  const dropCreateRef = useRef(null);
  const dropViewRef = useRef(null);
  const handleChange = (path, event) => {
    const { target } = event;
  
    const value =
      target.type === "checkbox"
        ? target.checked ? "wizard" : "form"
        : target.value;
  
    dispatchFormAction({ type: path, value });
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

 

  const handleRoleInputChange = (section) => (e) => {
    const inputValue = e.target.value;

    setRolesState((prevState) => {
      const allRoles = userRoles.filter((role) =>
        role.name.toLowerCase().includes(inputValue.toLowerCase())
      );


      const filteredRoles = allRoles.filter(role =>
        !prevState[section].selectedRoles.includes(role.name)
      );

      return {
        ...prevState,
        [section]: {
          ...prevState[section],
          roleInput: inputValue,
          filteredRoles: filteredRoles,
        },
      };
    });
  };
  


  const handleRoleSelect = (role, section) => {
    setRolesState((prevState) => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        selectedRoles: !prevState[section].selectedRoles.includes(role.name)
          ? [...prevState[section].selectedRoles, role.name]
          : prevState[section].selectedRoles,
        roleInput: '',
        filteredRoles: [],
      },
    }));
  };

  const removeRole = (role, section) => {
    setRolesState((prevState) => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        selectedRoles: prevState[section].selectedRoles.filter((r) => r !== role),
      },
    }));
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

  const handleClickOutside = (event) => {
    if (dropEditRef.current && !dropEditRef.current.contains(event.target)) {
      setRolesState((prevState) => ({
        ...prevState,
        edit: { ...prevState.edit, filteredRoles: [] },
      }));
    }
    if (dropCreateRef.current && !dropCreateRef.current.contains(event.target)) {
      setRolesState((prevState) => ({
        ...prevState,
        create: { ...prevState.create, filteredRoles: [] },
      }));
    }
    if (dropViewRef.current && !dropViewRef.current.contains(event.target)) {
      setRolesState((prevState) => ({
        ...prevState,
        view: { ...prevState.view, filteredRoles: [] },
      }));
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Modal className="d-flex flex-column align-items-start w-100 settings-modal" show={show} onHide={handleClose} dialogClassName="modal-50w" backdrop="static">
      <Modal.Header>
        <Modal.Title>{t("Settings")}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        {/* Section 1: Basic */}
        <div className='section'>
          <h5 className='fw-bold'>{t("Basic")}</h5>
          <FormInput value={newFormName} label={t("Name")} onChange={(e) => setNewFormName(e.target.value)} dataTestid="form-name" ariaLabel={t("Form Name")} />
          <FormTextArea
            label={t("Description")}
            value={newFormDescription}
            onChange={(e) => setNewFormDescription(e.target.value)}
            aria-label={t("Description of the edited form")}
            data-testid="form-description"
            maxRows={3}
          />
          <div className="info-panel">
            <div className='d-flex align-items-center'>
              <InfoIcon />
              <div className='field-label ms-2'>{t("Note")}</div>
            </div>
            <div className='info-content'>
              {t("Allowing the addition of multiple pages in a single form will prevent you from using this form in a bundle later.")}
            </div>
          </div>

          <Form.Check
            data-testid="form-edit-wizard-display"
            type="checkbox"
            id="createCheckbox"
            label={t("Allow adding multiple pages in this form")}
            checked={form.display === "wizard"}
            onChange={(event) => handleChange("display", event)}


            className='field-label'
          />

        </div>

        <div className='modal-hr' />

        <div className="section">
          <h5 className='fw-bold'>{t("Permissions")}</h5>

          <Form.Label className='field-label'>{t("Who Can Edit This Form")}</Form.Label>
          <CustomRadioButton items={[
            { label: t("Only You"), onClick: () => setRolesState((prev) => ({ ...prev, edit: { ...prev.edit, selectedOption: 'onlyYou' } })) },
            { label: t("You and specified roles"), onClick: () => setRolesState((prev) => ({ ...prev, edit: { ...prev.edit, selectedOption: 'specifiedRoles' } })) },
          ]} dataTestid="edit-submission-role" ariaLabel={t("Edit Submission Role")} />

          {rolesState.edit.selectedOption === 'onlyYou' && (
            <FormInput disabled={true} />
          )}
          {rolesState.edit.selectedOption === 'specifiedRoles' && (
            <>
              <div className='w-100'>
                <div className="input-with-pills form-control cursor-pointer position-relative">
                  {rolesState.edit.selectedRoles.map((role, index) => (
                    <CustomPill key={index} label={role} icon={true} bg="primary" onClick={() => removeRole(role, 'edit')} />
                  ))}
                  <input type="text" value={rolesState.edit.roleInput} onChange={handleRoleInputChange('edit')} className="role-input" />
                </div>

                {rolesState.edit.filteredRoles.length > 0 && (
                  <div className="input-drop cursor-pointer w-70" ref={dropEditRef}>
                    <ListGroup>
                      {rolesState.edit.filteredRoles.map((role) => (
                        <ListGroup.Item key={role.id} onClick={() => handleRoleSelect(role, 'edit')}>
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
            checked={rolesState.create.isChecked}
            onChange={() => setRolesState((prev) =>
              ({ ...prev, create: { ...prev.create, isChecked: !prev.create.isChecked } }))}
            className='field-label'
          />
          <CustomRadioButton items={[
            { label: t("Registered users"), onClick: () => setRolesState((prev) => ({ ...prev, create: { ...prev.create, selectedOption: 'registeredUsers' } })) },
            { label: t("Specific roles"), onClick: () => setRolesState((prev) => ({ ...prev, create: { ...prev.create, selectedOption: 'specifiedRoles' } })) },
          ]} dataTestid="create-submission-role" ariaLabel={t("Create Submission Role")} />

          {rolesState.create.selectedOption === 'registeredUsers' && (
            <FormInput disabled={true} />
          )}
          {rolesState.create.selectedOption === 'specifiedRoles' && (
            <>
              <div className='w-100'>
                <div className="input-with-pills form-control cursor-pointer position-relative">
                  {rolesState.create.selectedRoles.map((role, index) => (
                    <CustomPill key={index} label={role} icon={true} bg="primary" onClick={() => removeRole(role, 'create')} />
                  ))}
                  <input type="text" value={rolesState.create.roleInput} onChange={handleRoleInputChange('create')} className="role-input" />
                </div>

                {rolesState.create.filteredRoles.length > 0 && (
                  <div className="input-drop cursor-pointer w-70" ref={dropCreateRef}>
                    <ListGroup>
                      {rolesState.create.filteredRoles.map((role) => (
                        <ListGroup.Item key={role.id} onClick={() => handleRoleSelect(role, 'create')}>
                          {role.name}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                )}
              </div>
            </>
          )}

          <Form.Label className="field-label mt-3">{t("Who Can View Submissions")}</Form.Label>
          <CustomRadioButton
            items={[
              { label: t("Submitter"), onClick: () => setRolesState((prev) => ({ ...prev, view: { ...prev.view, selectedOption: 'submitter' } })) },
              { label: t("Submitter and specified roles"), onClick: () => setRolesState((prev) => ({ ...prev, view: { ...prev.view, selectedOption: 'specifiedRoles' } })) },
            ]}
            dataTestid="view-submission-role"
            ariaLabel={t("View Submission Role")}
          />

          {rolesState.view.selectedOption === 'submitter' && (
            <FormInput disabled={true} />
          )}

          {rolesState.view.selectedOption === 'specifiedRoles' && (
            <>
              <div className="w-100">
                <div className="input-with-pills form-control cursor-pointer position-relative">
                  {rolesState.view.selectedRoles.map((role, index) => (
                    <CustomPill
                      key={index}
                      label={role}
                      icon={true}
                      bg="primary"
                      onClick={() => removeRole(role, 'view')}
                    />
                  ))}
                  <input
                    type="text"
                    value={rolesState.view.roleInput}
                    onChange={handleRoleInputChange('view')}
                    className="role-input"
                  />
                </div>

                {rolesState.view.filteredRoles.length > 0 && (
                  <div className="input-drop-view cursor-pointer w-70" ref={dropViewRef}>
                    <ListGroup>
                      {rolesState.view.filteredRoles.map((role) => (
                        <ListGroup.Item
                          key={role.id}
                          onClick={() => handleRoleSelect(role, 'view')}>
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

        <div className='modal-hr' />

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
          <Form.Group className='settings-input w-100' controlId="url-input">
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
