import React from "react";
import { useRef, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Dropdown from "react-bootstrap/Dropdown";
import Loader from "./Assets/Loader.svg";
import Chevron from "./Assets/Chevron.svg";

const CustomButton = ({
  variant,
  size,
  label,
  onClick,
  isDropdown,
  dropdownItems,
  disabled,
  icon,
  className,
  dataTestid,
  ariaLabel,
}) => {
  const buttonRef = useRef(null);
  const toggleRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState({});
    const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (buttonRef.current && toggleRef.current) {
      const buttonWidth = buttonRef.current.offsetWidth;
      const toggleWidth = toggleRef.current.offsetWidth;
      const totalWidth = buttonWidth + toggleWidth - 1;
      console.log(buttonWidth,"btn");
      console.log(toggleWidth,"tgl");
      console.log(totalWidth,"total");
      setMenuStyle({
        minWidth: `${totalWidth}px`,
        borderTop: "none",
        borderTopLeftRadius: "0",
        borderTopRightRadius: "0",
        padding: "0",
      });
    }
  }, []);

  if (isDropdown) {
    return (
      <Dropdown
        as={ButtonGroup}
        className={className}
        onToggle={(isOpen) => setDropdownOpen(isOpen)}
      >
        <Button
          variant={variant}
          size={size}
          disabled={disabled}
          ref={buttonRef}
          data-testid={dataTestid}
          aria-label={ariaLabel}
        >
          {label}
        </Button>

        <Dropdown.Toggle
          ref={toggleRef}
          split
          variant={variant}
          id="dropdown-split-basic"
          className={`default-arrow ${dropdownOpen ? '' : 'collapsed'}`}
        >
          <img src={Chevron} alt="Chevron icon" />
        </Dropdown.Toggle>

        <Dropdown.Menu style={menuStyle}>
          {dropdownItems.map((item, index) => (
            <Dropdown.Item
              key={index}
              onClick={item.onClick}
              data-testid={item.dataTestid}
              aria-label={item.ariaLabel}
            >
              {item.label}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-testid={dataTestid}
      aria-label={ariaLabel}
    >
      {variant === "secondary" && !isDropdown && icon && (
       <img src={Loader} alt="Loader icon" className="me-2"/>
      )}
      {label}
    </Button>
  );
};

export default CustomButton;
