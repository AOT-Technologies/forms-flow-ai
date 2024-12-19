import React, { useState, useRef, useEffect } from "react";
import {  useSelector } from "react-redux";
import { ListGroup } from "react-bootstrap";
import { CustomPill,DeleteIcon } from "@formsflow/components";
import PropTypes from 'prop-types';
import { HelperServices } from "@formsflow/service";

const RoleSelector = ({ allRoles = [], selectedRoles = [], setSelectedRoles }) => { 
  const [roleInput, setRoleInput] = useState("");
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // To control dropdown visibility
  const dropDownRef = useRef(null);
  const inputRef = useRef(null);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);

  // Filter roles based on input
  useEffect(() => {
    const filtered = allRoles.filter(
      (role) =>
        role.toLowerCase().includes(roleInput.toLowerCase()) &&
        !selectedRoles.includes(role)
    );
    setFilteredRoles(filtered);
  }, [roleInput, allRoles, selectedRoles]);

  // Handle input change
  const handleRoleInputChange = (e) => {
    setRoleInput(e.target.value);
  };

  // Handle role selection from dropdown
  const handleRoleSelect = (role) => {
    setSelectedRoles([...selectedRoles, role]);
    setRoleInput(""); // Clear input
    setIsDropdownOpen(false); // Close the dropdown after selecting a role
  };

  // Handle role removal
  const removeRole = (roleToRemove) => {
    setSelectedRoles(selectedRoles.filter((role) => role !== roleToRemove));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropDownRef.current &&
        !dropDownRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false); // Close dropdown if clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="multi-select w-100">
      <div className="input-with-pills form-control cursor-pointer position-relative">
        {selectedRoles.map((role, index) => (
          <CustomPill
            key={role + index}
            label={HelperServices.removeTenantKeyFromData(role,tenantKey)}
            icon={<DeleteIcon color="#253DF4" />}
            bg="primary"
            onClick={() => removeRole(role)}
          />
        ))}
        <input
          type="text"
          value={roleInput}
          onChange={handleRoleInputChange}
          onFocus={() => setIsDropdownOpen(true)} // Open dropdown when input is focused
          className="role-input"
          ref={inputRef} // Reference to input for outside click handling
        />
      </div>

      {isDropdownOpen && filteredRoles.length > 0 && (
        <div className="input-drop cursor-pointer w-70" ref={dropDownRef}>
          <ListGroup>
            {filteredRoles.map((role, index) => (
              <ListGroup.Item
                action={true}
                key={role + index}
                onClick={() => handleRoleSelect(role)}
              >
                {HelperServices.removeTenantKeyFromData(role,tenantKey)}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      )}
    </div>
  );
};

 
RoleSelector.propTypes = {
  allRoles: PropTypes.array,
  selectedRoles: PropTypes.array.isRequired, 
  setSelectedRoles: PropTypes.func.isRequired, 
};
 
export default RoleSelector;
