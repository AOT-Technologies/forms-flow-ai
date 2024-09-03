import React from "react";
import Form from "react-bootstrap/Form";

function CustomRadioButton({ labels ,onClick}) {
  return (
    <Form className="custom-radio-button mb-3">
      {labels.map((label, index) => (
        <Form.Check
          inline
          label={label}
          name="group1"
          type="radio"
          id={`inline-radio-${index + 1}`}
          key={`radio-${index + 1}`}
          defaultChecked={index === 0}
          onClick={() => onClick(label)}
        />
      ))}
    </Form>
  );
}

export default CustomRadioButton;
