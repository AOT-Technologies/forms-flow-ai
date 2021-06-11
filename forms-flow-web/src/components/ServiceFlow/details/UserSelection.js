import React, {useState} from "react";
import Select from 'react-select';
import {useSelector} from "react-redux";
import "./TaskDetail.scss";

const UserSelection = React.memo((props)=>{
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
            <button className="btn btn-pos" title="Update User" onClick={()=>onChangeClaim(selectedValue?.value||null)}>
              <img src="/webfonts/fa_check.svg" alt="back"/>
            </button>
            <button className="btn btn-pos" onClick={onClose} title="Close">
            <img src="/webfonts/fa_times-circle.svg" alt="back"/>
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
});


export default  UserSelection;
