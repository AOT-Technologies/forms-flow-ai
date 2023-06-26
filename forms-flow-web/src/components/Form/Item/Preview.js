import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Form, Errors, Formio } from "react-formio";
import { push } from "connected-react-router";
import { Button } from "react-bootstrap";
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
import LoadingOverlay from "react-loading-overlay";
import FormHistoryModal from "./FormHistoryModal";
import CreateTemplateConfirmModal from "./CreateTemplateConfirmModal";
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
    <div className="container">
      <div className=" d-flex justify-content-between align-items-center  ">
        <h3 className="task-head col-8 text-truncate">
          {" "}
          <i className="fa fa-wpforms" aria-hidden="true" /> &nbsp;{" "}
          {form?.title}
        </h3>

        <div>
          <button
            className="btn btn-primary"
            onClick={() => {
              gotoEdit();
            }}
          >
            <i className="fa fa-pencil" aria-hidden="true" />
            &nbsp;&nbsp;<Translation>{(t) => t("Edit Form")}</Translation>
          </button>
          <button
            className="btn btn-outline-secondary ml-2 "
            onClick={() => {
              handleModalChange();
            }}
          >
            <i className="fa fa-rotate-left  " aria-hidden="true" />
            &nbsp;&nbsp;<Translation>{(t) => t("Form History")}</Translation>
          </button>
          <button
            className="btn btn-outline-primary ml-2"
            disabled={newpublishClicked}
            onClick={() => {
              publishConfirmModalChange();
            }}
          >
            <i className="fa fa-clone" aria-hidden="true"></i>
            &nbsp;&nbsp;
            <Translation>{(t) => t("Duplicate Form")}</Translation>
          </button>
          <Button
            variant="contained"
            onClick={handleNext}
            className="ml-3 btn btn-primary  "
          >
            {
              (activeStep === 1,
              (<Translation>{(t) => t("Next")}</Translation>))
            }
          </Button>
        </div>
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
          options={{ readOnly:true, language: lang, i18n: formio_resourceBundles }}
        />
      </LoadingOverlay>
    </div>
  );
};



 

export default Preview;
