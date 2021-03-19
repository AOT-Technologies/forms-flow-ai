import React, {useState} from "react";
import Select from 'react-select';
import {useSelector} from "react-redux";
import "./TaskDetail.scss";

const UserSelection = (props)=>{
  const {onClose, currentUser, onChangeClaim} = props;
  const userList = useSelector((state) => state.bpmTasks.userList);
  const options = userList.map((user)=>{
    return {value:user.id, label:user.id}
  });
  const customThemeFn = (theme) => ({
    ...theme,
    spacing: {
      controlHeight: 25,
    }
  })
  const [selectedValue, changeSelectedValue] =useState({value:currentUser,label:currentUser});
  return (<>
            <button className="btn" title="Update User" onClick={()=>onChangeClaim(selectedValue?.value||null)}>
              <i className="fa fa-check" aria-hidden="true"/>
            </button>
            <button className="btn" onClick={onClose} title="Close">
              <i className="fa fa-times" aria-hidden="true"/>
            </button>
            <Select options={options}
                    theme={customThemeFn}
                    isClearable
                    isSearchable
                    value={selectedValue}
                    onChange={changeSelectedValue}
                    className="select-user"
            />
            </>);
};


export default  UserSelection;
