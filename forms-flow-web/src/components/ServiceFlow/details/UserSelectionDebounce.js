import React, {useState} from "react";
import AsyncSelect from 'react-select/async';
import {useDispatch} from "react-redux";
import {Row, Col} from "react-bootstrap";
import "./TaskDetail.scss";
import {fetchUserListWithSearch} from "../../../apiManager/services/bpmTaskServices";
import {UserSearchFilterTypes} from "../constants/userSearchFilterTypes";
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';

const UserSelectionDebounce = React.memo((props) => {
  const {onClose, currentUser, onChangeClaim} = props;
  const dispatch = useDispatch();
  const customThemeFn = (theme) => ({
    ...theme,
    spacing: {
      controlHeight: 25,
    }
  });
  const [selectedValue, changeSelectedValue] = useState({value: currentUser, label: currentUser});
  const [searchTypeOption] = useState(UserSearchFilterTypes[0]);
  const [isSearch, setIsSearch] = useState(false);

  const loadOptions = (inputValue = "", callback) => {
    dispatch(fetchUserListWithSearch({searchType: searchTypeOption.searchType, query: inputValue}, (err, res) => {
      if (!err) {
        const userListOptions = res.map((user) => {
          return {
            value: user.id,
            label: user.id,
            email: user.email,
            firstName: user.firstName,
            id: user.id,
            lastName: user.lastName
          }
        });
        setIsSearch(true);
        callback(userListOptions);
      }
    }));
  };

  const formatOptionLabel = ({id, firstName, lastName, email}, {context}) => {
    if (context === "value") {
      return <div className="p-2">{id}</div>;
    } else if (context === "menu") {
      return (
        <div className="p-2" style={{display: "flex", flexDirection: "column"}}>
          <div>{id}</div>
          <div>
            {`(${lastName} ${firstName})`}
          </div>
        </div>
      );
    }
  };

  return (<>
    <Row md={{span: 3, offset: 3}}>
      <Col xs={12} md={10}>
        <button className="btn btn-pos" title="Update User" onClick={() => onChangeClaim(selectedValue?.value || null)}>
          <img src="/webfonts/fa_check.svg" alt="back"/>
        </button>
        <button className="btn btn-pos" onClick={onClose} title="Close">
          <img src="/webfonts/fa_times-circle.svg" alt="back"/>
        </button>
      </Col>
    </Row>
    <Row>
      <Col sm={10}>
        <AsyncSelect
          cacheOptions
          theme={customThemeFn}
          loadOptions={loadOptions}
          isClearable
          defaultOptions
          onChange={changeSelectedValue}
          className="select-user"
          placeholder={isSearch ? searchTypeOption.title || 'Select...' : ""}
          formatOptionLabel={formatOptionLabel}
        />
      </Col>
      <Col sm={2}>
        <DropdownButton id="dropdown-basic-button"
                        title={<i className="fa fa-filter"/>}
                        size="sm"
                        variant="secondary">
          <Dropdown.Item><Form.Check
            type="radio"
            id="sort"
            label="Search By First Name"
            checked="true"
          />
          </Dropdown.Item>
          <Dropdown.Item>
            <Form.Check
              type="radio"
              id="sort"
              label="Search By Last Name"
              checked="true"
            />
          </Dropdown.Item>
          <Dropdown.Item>
            <Form.Check
              type="radio"
              id="sort"
              label="Search By Email"
              checked="true"
            />
          </Dropdown.Item>
        </DropdownButton>
      </Col>
    </Row>
  </>);
});


export default UserSelectionDebounce;
