import React, {useState} from "react";
import AsyncSelect from 'react-select/async';
import {useDispatch} from "react-redux";
import {Row, Col} from "react-bootstrap";
import "./TaskDetail.scss";
import {fetchUserListWithSearch} from "../../../apiManager/services/bpmTaskServices";
import {
  SearchByEmail,
  SearchByFirstName,
  SearchByLastName,
  UserSearchFilterTypes
} from "../constants/userSearchFilterTypes";
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
  const [searchTypeOption,setSearchTypeOption] = useState(UserSearchFilterTypes[0]);
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

  const formatNameLabel=(firstName, lastName, email)=>{
    switch (searchTypeOption.searchType){
      case SearchByLastName:
        return `(${lastName||''} ${firstName||''})`
      case SearchByFirstName:
        return `(${firstName||''} ${lastName||''})`
      case SearchByEmail:
        return `(${email||''})`;
      default:
        return '';
    }
  };

  const formatOptionLabel = ({id, firstName, lastName, email}, {context}) => {
    if (context === "value") {
      return <div className="p-2">{id}</div>;
    } else if (context === "menu") {
      return (
        <div className="p-2 click-element" style={{display: "flex", flexDirection: "column"}}>
          <div>{id}</div>
          <div>
            {formatNameLabel(firstName, lastName, email)}
          </div>
        </div>
      );
    }
  };

  return (<>
    <Row md={{span: 3, offset: 3}}>
      <Col xs={12} md={10}>
        <button className="btn btn-pos" title="Update User" onClick={() => onChangeClaim(selectedValue?.value || null)}>
        <i className="fa fa-check fa-lg mr-1" />
        </button>
        <button className="btn btn-pos" onClick={onClose} title="Close">
        <i className="fa fa-times-circle fa-lg mr-1" />
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
      <Col sm={2} className="p-0">
        <DropdownButton id="dropdown-basic-button"
                        title={<i className="fa fa-filter"/>}
                        size="sm"
                        variant="secondary">
          {UserSearchFilterTypes.map((UserSearchFilterType)=>{
            return <Dropdown.Item className="click-element" onClick={()=>setSearchTypeOption(UserSearchFilterType)}>
              <Form.Check
              type="radio"
              id={UserSearchFilterType.searchType}
              key={UserSearchFilterType.searchType}
              label={UserSearchFilterType.title}
              value={UserSearchFilterType.searchType}
              checked={searchTypeOption.searchType===UserSearchFilterType.searchType}
            />
            </Dropdown.Item>
          })}
        </DropdownButton>
      </Col>
    </Row>
  </>);
});


export default UserSelectionDebounce;
