import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Form, Errors, Formio } from "react-formio";
import { push } from "connected-react-router";
import Loading from "../../../containers/Loading";
import { Translation } from "react-i18next";
import { formio_resourceBundles } from "../../../resourceBundles/formio_resourceBundles";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import {
  setFormFailureErrorData,
  setFormHistories,
  setFormSuccessData,
} from "../../../actions/formActions";
import {
  formCreate, getFormHistory,
} from "../../../apiManager/services/FormServices";

import _ from "lodash";
import { manipulatingFormData } from "../../../apiManager/services/formFormatterService";
import { saveFormProcessMapperPost } from "../../../apiManager/services/processServices";
import { toast } from "react-toastify";
import { t } from "i18next";
import { INACTIVE } from "../constants/formListConstants";
import LoadingOverlay from "react-loading-overlay-ts";
import FormHistoryModal from "./FormHistoryModal";
import CreateTemplateConfirmModal from "./CreateTemplateConfirmModal";
import { handleAuthorization } from "../../../apiManager/services/authorizationService";
const Preview = ({handleNext, hideComponents, activeStep}) => {
  const dispatch = useDispatch();
  const [newpublishClicked, setNewpublishClicked] = useState(false);
  const [confirmPublishModal, setConfirmPublishModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const submissionAccess = useSelector((state) => state.user?.submissionAccess || []) ;
  const formAccess = useSelector((state) => state.user?.formAccess || []) ;
  const {form, isActive: isFormActive, errors} = useSelector(state => state.form || {});
  const lang = useSelector(state => state.user.lang);
  const formProcessList = useSelector(state => state.process?.formProcessList);

  const handleModalChange = () => {
    setHistoryModal(!historyModal);
  };

  const publishConfirmModalChange = ()=> {
    setConfirmPublishModal(!confirmPublishModal);
  };
 
  useEffect(()=>{
    if(formProcessList?.parentFormId){
      getFormHistory(formProcessList?.parentFormId).then((res) => {
        dispatch(setFormHistories(res.data));
      })
      .catch(() => {
        dispatch(setFormHistories([]));
      });
    }
  },[formProcessList]);



  const handlePublishAsNewVersion = ()=>{
    setNewpublishClicked(true);
    setConfirmPublishModal(!confirmPublishModal);
    const newFormData = manipulatingFormData(
      _.cloneDeep(form),
      MULTITENANCY_ENABLED,
      tenantKey,
      formAccess,
      submissionAccess
    );

    const newPathAndName = "duplicate-version-" + Math.random().toString(16).slice(9);
    newFormData.path = newPathAndName;
    newFormData.title += "-copy";
    newFormData.name = newPathAndName;
    newFormData.componentChanged = true;
    delete newFormData.machineName;
    delete newFormData.parentFormId;
    newFormData.newVersion = true;
    delete newFormData._id;
    formCreate(newFormData)
      .then((res) => {
        const form = res.data;
        const columnsToPick = [
          "anonymous",
          "status",
          "taskVariable",
          "tags",
          "components",
          "processKey",
          "processName",
        ];
        const data = _.pick(formProcessList, columnsToPick);
        data.parentFormId = form._id;
        data.formId = form._id;
        data.formName = form.title;
        data.status = data.status || INACTIVE;
        data.formType = form.type;
        data.formRevisionNumber = "V1";
        data.formTypeChanged = true;
        data.titleChanged = true;
        data.anonymousChanged = true;

        Formio.cache = {};
        const payload = {
          resourceId:data.formId,
          resourceDetails: {},
          roles : []
        };

        handleAuthorization( { application: payload, designer: payload, form: payload }
          ,data.formId).catch((err)=>console.error(err));
        
        dispatch(setFormSuccessData("form", form));
        dispatch(
          // eslint-disable-next-line no-unused-vars
          saveFormProcessMapperPost(data, (err, res) => {
            if (!err) {
              toast.success(t("Duplicate form created successfully"));
              dispatch(push(`${redirectUrl}formflow/${form._id}/view-edit/`));
            } else {
              toast.error(t("Error in creating form process mapper"));
            }
          })
        );
      })
      .catch((err) => {
        let error = "";
        if (err.response?.data) {
          error = err.response.data;
        } else {
          error = err.message;
        }
        dispatch(setFormFailureErrorData("form", error));
      })
      .finally(() => {
        setNewpublishClicked(false);
      });
  };
 

  const gotoEdit = () =>{
    dispatch(push(`${redirectUrl}formflow/${form._id}/edit`));
  };

 
  if (isFormActive) {
    return <Loading />;
  }
  return (
 
    <div className="mt-3">
       <h3 className="task-head col-12 text-truncate my-4 mx-0 px-0">
 
          <i className="fa-solid fa-file-lines" aria-hidden="true" /> &nbsp;{" "}
          {form?.title}
        </h3>
      <div className=" d-flex flex-column flex-md-row justify-content-md-end align-items-md-center mb-3">
    
        
          <button
            className="btn btn-primary"
            onClick={() => {
              gotoEdit();
          }}
          data-testid="form-edit-button"
          >
            <i className="fa fa-pencil" aria-hidden="true" />
            &nbsp;&nbsp;<Translation>{(t) => t("Edit Form")}</Translation>
          </button>
          <button
            className="btn btn-outline-secondary ms-md-2 my-md-0 my-2 "
            onClick={() => {
              handleModalChange();
            }}
            data-testid="form-version-history-button"
          >
            <i className="fa fa-rotate-left  " aria-hidden="true" />
            &nbsp;&nbsp;<Translation>{(t) => t("Form History")}</Translation>
          </button>
          <button
            className="btn btn-outline-primary ms-md-2 my-md-0 my-2"
            disabled={newpublishClicked}
            onClick={() => {
              publishConfirmModalChange();
            }}
            data-testid="form-duplicate-button"
          >
            <i className="fa fa-clone" aria-hidden="true"></i>
            &nbsp;&nbsp;
            <Translation>{(t) => t("Duplicate Form")}</Translation>
          </button>
          <button
            onClick={handleNext}
            className="ms-md-2 my-md-0 my-2 btn btn-primary"
            data-testid="form-next-button"
          >
            {
              (activeStep === 1,
              (<Translation>{(t) => t("Next")}</Translation>))
            }
          </button>
 
      </div>

      <CreateTemplateConfirmModal modalOpen={confirmPublishModal}
      handleModalChange={publishConfirmModalChange}
      onConfirm = {handlePublishAsNewVersion}
      />
      
      <FormHistoryModal historyModal={historyModal}
       handleModalChange={handleModalChange}
       gotoEdit={gotoEdit}
       />

      <Errors errors={errors} />
      <LoadingOverlay
        active={newpublishClicked}
        spinner
        text={t("Loading...")}
      >
        <Form
          form={form}
          hideComponents={hideComponents}
          options={{ disabled: { submit: true },
          buttonSettings: {
            showSubmit: false
          },
          disableAlerts: true,
          noAlerts: true,
          language: lang, i18n: formio_resourceBundles }}
          
        />
      </LoadingOverlay>
    </div>
  );
};



 

export default Preview;
