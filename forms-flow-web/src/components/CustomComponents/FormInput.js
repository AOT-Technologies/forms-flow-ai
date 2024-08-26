import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';


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
  icon = true,
  onIconClick  //prop for icon click
}) => {

  const inputClassNames = "Form-control-input " + className ;
 console.log(isInvalid);
  return (
    <div className="Form-input-box" >
      <Form.Group className={className} controlId={`form-${label}`}>
      {label && (
        <Form.Label className='custom-form-control-label'>
          {label} { required && <span className='required-icon'>*</span>}
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
            <InputGroup.Text className="custom-icon" id="basic-addon1" onClick={onIconClick}>{icon}</InputGroup.Text>
          )
        }
        {isInvalid && (
          <Form.Control.Feedback className='custom-feedback' type="invalid">
            {feedback}
          </Form.Control.Feedback>
        )}

      </InputGroup>
    </Form.Group>
    </div>
  );
};

export default FormInput;
