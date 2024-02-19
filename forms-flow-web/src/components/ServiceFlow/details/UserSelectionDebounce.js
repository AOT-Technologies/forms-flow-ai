import React, { useState,useEffect, useRef } from "react";
import AsyncSelect from "react-select/async";
import { useDispatch } from "react-redux";
import { Row, Col } from "react-bootstrap";
import "./TaskDetail.scss";
import { fetchUserListWithSearch } from "../../../apiManager/services/bpmTaskServices";
import {
  SearchByEmail,
  SearchByFirstName,
  SearchByLastName,
  UserSearchFilterTypes,
} from "../constants/userSearchFilterTypes";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";

const UserSelectionDebounce = React.memo((props) => {
  const { onClose, currentUser, onChangeClaim } = props;
  const dispatch = useDispatch();
  const customThemeFn = (theme) => ({
    ...theme,
    spacing: {
      controlHeight: 25,
    },
  });
  const userSelectionRef = useRef(null);
  const handleClick = (e) => {
    if (userSelectionRef?.current?.contains(e.target)) {
      return;
    }
    // outside click
    onClose();
  };
  
  useEffect(() => {
    // add when mounted
    document.addEventListener("mousedown", handleClick);
    // return function to be called when unmounted
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);
  const [selectedValue, changeSelectedValue] = useState({
    value: currentUser,
    label: currentUser,
  });
  const [searchTypeOption, setSearchTypeOption] = useState(
    UserSearchFilterTypes[0]
  );
  const [isSearch, setIsSearch] = useState(false);
  const loadOptions = (inputValue = "", callback) => {
    dispatch(
      fetchUserListWithSearch(
        { searchType: searchTypeOption.searchType, query: inputValue },
        (err, res) => {
          if (!err) {
            const userListOptions = res.map((user) => {
              return {
                value: user.username,
                label: user.username,
                email: user.email,
                firstName: user.firstName,
                id: user.username,
                lastName: user.lastName,
              };
            });
            setIsSearch(true);
            callback(userListOptions);
          }
        }
      )
    );
  };

  const formatNameLabel = (firstName, lastName, email) => {
    switch (searchTypeOption.searchType) {
      case SearchByLastName:
        return `(${lastName || ""} ${firstName || ""})`;
      case SearchByFirstName:
        return `(${firstName || ""} ${lastName || ""})`;
      case SearchByEmail:
        return `(${email || ""})`;
      default:
        return "";
    }
  };
  const handleChange = (selectedOption) => {
    changeSelectedValue(selectedOption);
    onChangeClaim(selectedOption?.value || null);
  };

  const formatOptionLabel = (
    { id, firstName, lastName, email },
    { context }
  ) => {
    if (context === "value") {
      return <div className="p-2">{id}</div>;
    } else if (context === "menu") {
      return (
        <div
          className="d-flex flex-column p-2 click-element"
        >
          <div>{id}</div>
          <div>{formatNameLabel(firstName, lastName, email)}</div>
        </div>
      );
    }
  };

  return (
    <>
      <Row ref={userSelectionRef}>
        <Col sm={10} className="no-padding-left pe-1">
          <AsyncSelect
            cacheOptions
            theme={customThemeFn}
            loadOptions={loadOptions}
            isClearable
            defaultOptions
            onChange={handleChange}
            className="select-user"
            placeholder={isSearch ? searchTypeOption.title || "Select..." : ""}
            formatOptionLabel={formatOptionLabel}
            onMenuClose={onClose}
            value={selectedValue}
          />
        </Col>
        <Col sm={2} className="p-0 no-padding-left">
          <DropdownButton
            id="dropdown-basic-button"
            title={<i className="fa fa-filter" />}
            size="sm"
            variant="secondary"
          >
            {UserSearchFilterTypes.map((UserSearchFilterType, idx) => {
              return (
                <Dropdown.Item
                  key={idx}
                  className="click-element"
                  onClick={() => setSearchTypeOption(UserSearchFilterType)}
                >
                  <Form.Check
                    type="radio"
                    id={UserSearchFilterType.searchType}
                    key={UserSearchFilterType.searchType}
                    label={UserSearchFilterType.title}
                    value={UserSearchFilterType.searchType}
                    checked={
                      searchTypeOption.searchType ===
                      UserSearchFilterType.searchType
                    }
                  />
                </Dropdown.Item>
              );
            })}
          </DropdownButton>
        </Col>
      </Row>
    </>
  );
});

export default UserSelectionDebounce;
