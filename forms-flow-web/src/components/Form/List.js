import React, {useEffect, useRef, useState} from "react";
import {connect, useDispatch, useSelector} from "react-redux";
import { push } from "connected-react-router";
import { Link } from "react-router-dom";
import {Button} from "react-bootstrap";
import { toast } from 'react-toastify';
import {
  indexForms,
  selectRoot,
  selectError,
  Errors,
  FormGrid,
  deleteForm,
  saveForm
} from "react-formio";
import Loading from "../../containers/Loading";
import {
  STAFF_DESIGNER,
} from "../../constants/constants";
import "../Form/List.scss";
import {
  setBPMFormLimit,
  setBPMFormListLoading,
  setBPMFormListPage, setBPMFormListSort,
  setFormDeleteStatus, setMaintainBPMFormPagination
} from "../../actions/formActions";
import Confirm from "../../containers/Confirm";
import {fetchBPMFormList, fetchFormByAlias} from "../../apiManager/services/bpmFormServices";
import {designerColumns, getOperations, userColumns} from "./constants/formListConstants";
import FileService from "../../services/FileService";
import {setFormCheckList, setFormUploadList, updateFormUploadCounter} from "../../actions/checkListActions";
import FileModal from './FileUpload/fileUploadModal'
const List = React.memo((props)=> {
  const [showFormUploadModal, setShowFormUploadModal] = useState(false);
  //const [selectedForm,setSelectedForms] = useState([]);
  const dispatch = useDispatch();
  const uploadFormNode = useRef();
  const {
    forms,
    onAction,
    getForms,
    getFormsInit,
    errors,
    userRoles,
    formId,
    onNo,
    onYes,
  } = props;

  const isBPMFormListLoading = useSelector(state=> state.bpmForms.isActive);
  const bpmForms = useSelector(state=> state.bpmForms);
  const showViewSubmissions= useSelector((state) => state.user.showViewSubmissions);
  const formCheckList = useSelector(state => state.formCheckList.formList);
  const isDesigner = userRoles.includes(STAFF_DESIGNER);
  const operations = getOperations(userRoles, showViewSubmissions);
  const columns= isDesigner? designerColumns: userColumns;


  const getFormsList = (page,query)=>{
    if(page){
      dispatch(setBPMFormListPage(page));
    }
    if(query){
      dispatch(setBPMFormListSort(query.sort||''));
    }
  }

  const onPageSizeChanged=(pageSize)=>{
    if(isDesigner){
      dispatch(indexForms("forms", 1, {limit:pageSize}));
    }else{
      dispatch(setBPMFormLimit(pageSize));
    }
  }

  useEffect(()=>{
    dispatch(setFormCheckList([]))
  },[dispatch])

  useEffect(()=>{
    if(isDesigner){
      getFormsInit(1);
    }else {
      dispatch(setBPMFormListLoading(true))
      dispatch(fetchBPMFormList());
    }
  },[getFormsInit, dispatch, isDesigner])

  const downloadForms = () => {
    FileService.downloadFile({forms:formCheckList},()=>{
      toast.success(`${formCheckList.length} ${formCheckList.length===1?"Form":"Forms"} Downloaded Successfully`)
    })
  }

  const uploadClick = e => {
    dispatch(setFormUploadList([]));
    e.preventDefault();
    uploadFormNode.current?.click();
    return false;
  };

  const uploadFileContents = async (fileContent)=>{
    if(fileContent.forms && Array.isArray(fileContent.forms))
      {
    await Promise.all(
      fileContent.forms.map(async (formData)=>{
        return new Promise((resolve, reject) => {
          dispatch(saveForm("form", formData, async (err, form) => {
            if (err) {
              // get the form Id of the form if exists already in the server
              dispatch(fetchFormByAlias(formData.path, async (err, formObj) => {
                if (!err) {
                  formData._id = formObj._id;
                  dispatch(saveForm("form", formData, (err, form) => {
                    if (!err) {
                      dispatch(updateFormUploadCounter())
                      resolve();
                    }else{
                      reject();
                    }
                  }));
                }else{
                  reject();
                }
              }));
            } else {
              dispatch(updateFormUploadCounter())
              resolve()
            }
          }))
        });
    }));
  }
  else{
    setShowFormUploadModal(false);
    return (toast.error('Error in Json file structure'))
  }
  }

  const fileUploaded = async (evt) =>{
    FileService.uploadFile(evt,async (fileContent)=> {
      dispatch(setFormUploadList(fileContent?.forms||[]));
      setShowFormUploadModal(true);
      await uploadFileContents(fileContent);
      dispatch(indexForms("forms", 1, forms.query))
    })
  }

  if (forms.isActive || isBPMFormListLoading) {
      return <Loading />;
  }

  return (

      <div className="container">
        <Confirm
          modalOpen={props.modalOpen}
          message={
            "Are you sure you wish to delete the form " +
            props.formName +
            "?"
          }
          onNo={() => onNo()}
          onYes={() => onYes(formId, forms)}
        />
        <FileModal modalOpen={showFormUploadModal} onClose={()=>setShowFormUploadModal(false)} />
        <div className="flex-container">
          {/*<img src="/form.svg" width="30" height="30" alt="form" />*/}
          <div className="flex-item-left">
          <h3 className="task-head">
          <i className="fa fa-wpforms" aria-hidden="true"/>
             <span className="forms-text">Forms</span></h3>
          </div>
          <div className="flex-item-right">
          {userRoles.includes(STAFF_DESIGNER) && (
            <Link
              to="/formflow/create"
              className="btn btn-primary btn-left btn-sm"
            >
              <i className="fa fa-plus fa-lg" /> Create Form
            </Link>
          )}
          {userRoles.includes(STAFF_DESIGNER) && (
            <>
            <Button className="btn btn-primary btn-sm form-btn pull-right btn-left" onClick={uploadClick} title="Upload json form only">
            <i className="fa fa-upload fa-lg" aria-hidden="true"/> Upload Form</Button>
              <input type="file" className="d-none"
                     multiple={false}
                     accept=".json,application/json"
                     onChange={fileUploaded}
                     ref={uploadFormNode}
              />
            </>
          )}
          {userRoles.includes(STAFF_DESIGNER) && (
             <>
             <Button className="btn btn-primary btn-sm form-btn pull-right btn-left" onClick={downloadForms} disabled={formCheckList.length===0}  title="Select atleast one form">
             <i className="fa fa-download fa-lg" aria-hidden="true"/> Download Form</Button>
             </>
          )}
          </div>
        </div>
        <section className="custom-grid grid-forms">
          <Errors errors={errors} />
          <FormGrid
            columns={columns}
            forms={isDesigner?forms:bpmForms}
            onAction={onAction}
            getForms={isDesigner?getForms:getFormsList}
            operations={operations}
            onPageSizeChanged={onPageSizeChanged}
          />
        </section>
      </div>
    );
});

const mapStateToProps = (state) => {
  return {
    forms: selectRoot("forms", state),
    errors: selectError("forms", state),
    userRoles: selectRoot("user", state).roles || [],
    modalOpen: selectRoot("formDelete", state).formDelete.modalOpen,
    formId: selectRoot("formDelete", state).formDelete.formId,
    formName: selectRoot("formDelete", state).formDelete.formName,
    isFormWorkflowSaved: selectRoot("formDelete", state).isFormWorkflowSaved,
  };
};

const getInitForms =  (page=1, query)=>{
  return (dispatch, getState) => {
    const state = getState();
    const currentPage =state.forms.pagination.page;
    const maintainPagination = state.bpmForms.maintainPagination;
    dispatch(indexForms("forms", maintainPagination?currentPage:page, query));
  }
}

const mapDispatchToProps = (dispatch,ownProps) => {
  return {
    getForms: (page, query) => {
      dispatch(indexForms("forms", page, query));
    },
    getFormsInit: (page, query) => {
      dispatch(getInitForms( page, query));
    },
    onAction: (form, action) => {
      switch (action) {
        case "insert":
          dispatch(push(`/form/${form._id}`));
          break;
        case "submission":
          dispatch(push(`/form/${form._id}/submission`));
          break;
        // case "edit":
        //   dispatch(push(`/form/${form._id}/edit`));
        //   break;
        case "delete":
          const formDetails = {
            modalOpen: true,
            formId: form._id,
            formName: form.title,
          };
          dispatch(setFormDeleteStatus(formDetails));
          break;
        case "viewForm":
          dispatch(setMaintainBPMFormPagination(true));
          dispatch(push(`/formflow/${form._id}/view-edit`));
          break;
        default:
      }
    },
    onYes: (formId, forms) => {
      dispatch(
        deleteForm("form", formId, (err) => {
          if (!err) {
            const formDetails = { modalOpen: false, formId: "", formName: "" };
            dispatch(setFormDeleteStatus(formDetails));
            dispatch(indexForms("forms", 1, forms.query));
          }
        })
      );
    },
    onNo: () => {
      const formDetails = { modalOpen: false, formId: "", formName: "" };
      dispatch(setFormDeleteStatus(formDetails));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(List);
