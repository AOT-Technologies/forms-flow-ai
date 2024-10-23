import React, { useState, useRef, useEffect } from "react";
import { ListGroup } from "react-bootstrap";
import { CustomPill } from "@formsflow/components";

const RoleSelector = ({ allRoles, selectedRoles, setSelectedRoles }) => {
  const [roleInput, setRoleInput] = useState("");
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // To control dropdown visibility
  const dropDownRef = useRef(null);
  const inputRef = useRef(null);
 
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
    <div className="w-100">
      <div className="input-with-pills form-control cursor-pointer position-relative">
        {selectedRoles.map((role, index) => (
          <CustomPill
            key={index}
            label={role}
            icon={true}
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
          placeholder="Type to filter roles"
          ref={inputRef} // Reference to input for outside click handling
        />
      </div>

      {isDropdownOpen && filteredRoles.length > 0 && (
        <div className="input-drop cursor-pointer w-70" ref={dropDownRef}>
          <ListGroup>
            {filteredRoles.map((role, index) => (
              <ListGroup.Item
                key={index}
                onClick={() => handleRoleSelect(role)}
              >
                {role}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      )}
    </div>
  );
};

export default RoleSelector;
