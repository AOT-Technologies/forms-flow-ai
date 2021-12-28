import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Checkbox} from "@material-ui/core";
import {setFormCheckList} from "../../../actions/checkListActions";
import {getFormattedForm} from "../constants/formListConstants";


const SelectFormForDownload = React.memo(({form,type}) => {
  const formCheckList = useSelector(state => state.formCheckList.formList);
  const forms= useSelector(state=>state.forms.forms);
  const formObj = getFormattedForm(form);
  const [isFormChecked,setIsFormChecked]=useState(false);
  const [isAllFormChecked,setIsAllFormChecked]=useState(false);
  const dispatch= useDispatch();

  useEffect(()=>{
    if(formObj && formCheckList.length){
      const isFormAdded = formCheckList.some(formData=>formData.path===formObj.path);
      setIsFormChecked(isFormAdded);
    }else{
      setIsFormChecked(false);
    }
  },[formCheckList,formObj]);

  useEffect(()=>{
    if(formCheckList.length){
      const pathList = formCheckList.map(formData=>formData.path)
      setIsAllFormChecked(forms.every(formData => pathList.includes(formData.path)));
    }else{
      setIsAllFormChecked(false)
    }
  },[formCheckList,forms])

  const updateFormCheckList = (formInsert) => {
    let updatedFormCheckList = [...formCheckList];
   if(formInsert){
     updatedFormCheckList.push({...formObj});
   }else{
     const index = updatedFormCheckList.findIndex(formData=>formData.path===formObj.path);
     updatedFormCheckList.splice(index,1);
   }
    dispatch(setFormCheckList(updatedFormCheckList))
  }

  const addAllFormCheckList = (allFormInsert) => {
    if(!allFormInsert){
      dispatch(setFormCheckList([]));
    }else {
      let updatedFormCheckList = [...formCheckList];
      forms.forEach(formData => {
        const isFormAdded = formCheckList.some(formCheck => formData.path === formCheck.path);
        if (!isFormAdded) {
          let formObjToInsert = getFormattedForm(formData)
          updatedFormCheckList.push({...formObjToInsert});
        }
      })
      dispatch(setFormCheckList(updatedFormCheckList));
    }
  }


  if(type==="all"){
    return <Checkbox onChange={()=>addAllFormCheckList(!isAllFormChecked)} checked={isAllFormChecked} title="Select All"/>
  }

  return <Checkbox
    checked={isFormChecked}
    onChange={()=>updateFormCheckList(!isFormChecked)}/>
})

export default SelectFormForDownload;