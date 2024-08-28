import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { Translation } from "react-i18next";

const FormInput = ({
  type = "text",
  label,
  value = "",
  onChange,
  onBlur,
  placeholder = "",
  isInvalid = false,
  feedback = "",
  disabled = false,
  size,
  dataTestid,
  ariaLabel,
  className ,
  required = false,
  icon,
  id
}) => {

  const inputClassNames = "Form-control-input " + className ;
  return (
    <div className="Form-input-box" >
      <Form.Group controlId={id}>
      {label && (
        <Form.Label  className='custom-form-control-label'>
          <Translation>{(t) => t(label)}</Translation> { required && <span className='required-icon'>*</span>}
        </Form.Label>
      )}
      <InputGroup  className="custom-form-input-group" >
        <Form.Control
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          isInvalid={isInvalid}
          disabled={disabled}
          size={size}
          data-testid={dataTestid}
          aria-label={ariaLabel}
          required={required}
          className={inputClassNames}
        />
        {
          icon && (
            <InputGroup.Text id="basic-addon1" >{icon}</InputGroup.Text>
          )
        }
        {isInvalid && (
          <Form.Control.Feedback className='custom-feedback' type="invalid">
           <Translation>{(t) => t(feedback)}</Translation>
          </Form.Control.Feedback>
        )}

      </InputGroup>
    </Form.Group>
    </div>
  );
};

export default FormInput;
