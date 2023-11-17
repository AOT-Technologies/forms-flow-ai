import React, { useEffect, useRef, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { push } from "connected-react-router";
import { toast } from "react-toastify";
import _isEquial from "lodash/isEqual";
import { selectRoot, selectError, Errors, deleteForm } from "react-formio";
import Loading from "../../containers/Loading";
import Head from "../../containers/Head";
import { textTruncate } from "../../helper/helper";
import {
  MULTITENANCY_ENABLED,
  STAFF_DESIGNER,
} from "../../constants/constants";
import "../Form/List.scss";
import {
  setFormFailureErrorData,
  setBPMFormListLoading,
  setFormDeleteStatus,
} from "../../actions/formActions";
import Confirm from "../../containers/Confirm";
import {
  fetchBPMFormList,
  fetchFormByAlias,
  fetchFormById,
} from "../../apiManager/services/bpmFormServices";
import FileService from "../../services/FileService";
import {
  setFormCheckList,
  setFormSearchLoading,
  setFormUploadList,
  updateFormUploadCounter,
  formUploadFailureCount,
  DesignerAccessDenied,
} from "../../actions/checkListActions";
import FileModal from "./FileUpload/fileUploadModal";
import { useTranslation, Translation } from "react-i18next";
import { addHiddenApplicationComponent } from "../../constants/applicationComponent";
import {
  getFormProcesses,
  saveFormProcessMapperPost,
  saveFormProcessMapperPut,
  unPublishForm,
  getApplicationCount,
} from "../../apiManager/services/processServices";
import { addTenantkey } from "../../helper/helper";
import { formCreate, formUpdate } from "../../apiManager/services/FormServices";
import { getFormattedForm, INACTIVE } from "./constants/formListConstants";
import {
  handleAuthorization,
  fetchFormAuthorizationDetials,
} from "../../apiManager/services/authorizationService.js";
import FormTable from "./constants/FormTable";
import ClientTable from "./constants/ClientTable";
import { useMemo } from "react";
const List = React.memo((props) => {
  const { t } = useTranslation();
  const [showFormUploadModal, setShowFormUploadModal] = useState(false);
  const dispatch = useDispatch();
  const uploadFormNode = useRef();
  const {
    forms,
    getFormsInit,
    errors,
    userRoles,
    formId,
    onNo,
    onYes,
    tenants,
  } = props;
  const isBPMFormListLoading = useSelector((state) => state.bpmForms.isActive);
  const designerFormLoading = useSelector(
    (state) => state.formCheckList.designerFormLoading
  );
  const searchText = useSelector((state) => state.bpmForms.searchText);

  const isDesigner = userRoles.includes(STAFF_DESIGNER);
  const pageNo = useSelector((state) => state.bpmForms.page);
  const limit = useSelector((state) => state.bpmForms.limit);
  const sortBy = useSelector((state) => state.bpmForms.sortBy);
  const sortOrder = useSelector((state) => state.bpmForms.sortOrder);
  const formCheckList = useSelector((state) => state.formCheckList.formList);
  const formAccess = useSelector((state) => state.user?.formAccess || []);
  const submissionAccess = useSelector(
    (state) => state.user?.submissionAccess || []
  );

  const searchFormLoading = useSelector(
    (state) => state.formCheckList.searchFormLoading
  );
  const applicationCountResponse = useSelector(
    (state) => state.process?.applicationCountResponse
  );
  const formProcessData = useSelector((state) => state.process.formProcessList);
  const applicationCount = useSelector(
    (state) => state.process?.applicationCount
  );
  const tenantKey = tenants?.tenantId;
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";

  useEffect(() => {
    dispatch(setFormCheckList([]));
  }, [dispatch]);

  useEffect(() => {
    dispatch(setBPMFormListLoading(true));
  }, []);

  const fetchForms = () => {
    let filters = [pageNo, limit, sortBy, sortOrder, searchText];
    dispatch(setFormSearchLoading(true));
    dispatch(fetchBPMFormList(...filters));
  };

  useEffect(() => {
    fetchForms();
  }, [
    getFormsInit,
    dispatch,
    isDesigner,
    pageNo,
    limit,
    sortBy,
    sortOrder,
    searchText,
  ]);

  const formCheck = (formCheckList) => {
    const result = formCheckList.reduce(function (obj, v) {
      obj[v.type] = (obj[v.type] || 0) + 1;
      return obj;
    }, {});

    let response = "";

    if (result.resource) {
      response = `${result.resource} ${result.resource == 1 ? t("Resource") : t("Resources")
        }`;
    }
    if (result.form) {
      response += `${result.resource ? " ," : ""} ${result.form} ${result.form == 1 ? t("Form") : t("Forms")
        }`;
    }
    return toast.success(`${response} ${t("Downloaded Successfully")}`);
  };

  const headerList = () => {
    return [
      {
        name: "Forms",
        icon: "file-text-o mr-2",
      },
    ];
  };

  let headOptions = useMemo(() => {
    return isDesigner && headerList();
  }, [isDesigner]);

  const downloadForms = async () => {
    let downloadForm = [];
    for (const form of formCheckList) {
      let newFormData = await fetchFormById(form._id);
      newFormData = getFormattedForm(newFormData.data);
      downloadForm.push(newFormData);
    }

    if (downloadForm.length == formCheckList.length) {
      FileService.downloadFile({ forms: downloadForm }, () => {
        formCheck(downloadForm);
        dispatch(setFormCheckList([]));
      });
    } else {
      toast.error(`Download Failed`);
    }
  };

  const uploadClick = (e) => {
    dispatch(setFormUploadList([]));
    e.preventDefault();
    uploadFormNode.current?.click();
    return false;
  };

  const mapperHandler = (form) => {
    const data = {
      formId: form._id,
      formName: form.title,
      formType: form.type,
      formTypeChanged: true,
      anonymousChanged: true,
      parentFormId: form._id,
      titleChanged: true,
      formRevisionNumber: "V1", // to do
      anonymous: false,
    };
    dispatch(
      // eslint-disable-next-line no-unused-vars
      saveFormProcessMapperPost(data, (err, res) => {
        if (!err) {
          fetchForms();
        } else {
          dispatch(formUploadFailureCount());
        }
      })
    );
  };

  const isMapperSaveNeeded = (mapperData, formdata, applicationData) => {
    const applicationCount = applicationData?.data.value;
    // checks if the updates need to save to form_process_mapper too
    if (mapperData.formName !== formdata.title && applicationCount > 0) {
      return "new";
    }
    if (
      mapperData.formName !== formdata.title ||
      mapperData.formType !== formdata.type
    ) {
      return "update";
    }
  };

  const setDefaultAuthorization = (parentFormId) => {
    let payload = {
      resourceId: parentFormId,
      resourceDetails: {},
      roles: [],
    };
    handleAuthorization(
      { application: payload, designer: payload, form: payload },
      parentFormId
    ).catch((err) => {
      console.log(err);
    });
  };

  // upload file
  const uploadFileContents = async (fileContent) => {
    try {
      if (fileContent.forms && Array.isArray(fileContent.forms)) {
        await Promise.all(
          fileContent.forms.map(async (formData) => {
            return new Promise((resolve, reject) => {
              formData = addHiddenApplicationComponent(formData);
              let tenantDetails = {};
              if (MULTITENANCY_ENABLED && tenantKey) {
                tenantDetails = { tenantKey };
                formData.path = addTenantkey(formData.path, tenantKey);
                formData.name = addTenantkey(formData.name, tenantKey);
              }
              const newFormData = {
                ...formData,
                tags: ["common"],
                ...tenantDetails,
              };
              newFormData.access = formAccess;
              newFormData.submissionAccess = submissionAccess;
              newFormData.componentChanged = true;
              newFormData.newVersion = true;
              formCreate(newFormData)
                .then((res) => {
                  const { data } = res;
                  mapperHandler(data);
                  // call the auth api
                  setDefaultAuthorization(data._id);
                  dispatch(updateFormUploadCounter());
                })
                .catch(() => {
                  newFormData.componentChanged = false;
                  dispatch(
                    fetchFormByAlias(newFormData.path, async (err, formObj) => {
                      if (!err) {
                        dispatch(
                          // eslint-disable-next-line no-unused-vars
                          getFormProcesses(formObj._id, (err, mapperData) => {
                            // just update form
                            if (mapperData) {
                              fetchFormAuthorizationDetials(
                                formObj.parentFormId || formObj._id
                              )
                                .then(() => {
                                  dispatch(
                                    getApplicationCount(
                                      mapperData.id,
                                      (error, applicationCount) => {
                                        if (!error) {
                                          newFormData._id = formObj._id;
                                          newFormData.access = formObj.access;
                                          newFormData.submissionAccess =
                                            formObj.submissionAccess;
                                          newFormData.componentChanged =
                                            !_isEquial(
                                              newFormData.components,
                                              formObj.components
                                            ) ||
                                            newFormData.display !==
                                            formObj.display ||
                                            newFormData.type !== formObj.type;
                                          newFormData.parentFormId =
                                            mapperData.parentFormId;
                                          formUpdate(
                                            newFormData._id,
                                            newFormData
                                          )
                                            .then((formupdated) => {
                                              const updatedForm =
                                                formupdated.data;
                                              const data = {
                                                anonymous:
                                                  mapperData.anonymous === null
                                                    ? false
                                                    : mapperData.anonymous,
                                                formName: updatedForm.title,
                                                formType: updatedForm.type,
                                                parentFormId:
                                                  mapperData.parentFormId,
                                                status: mapperData.status
                                                  ? mapperData.status
                                                  : INACTIVE,
                                                taskVariable:
                                                  mapperData.taskVariable
                                                    ? mapperData.taskVariable
                                                    : [],
                                                id: mapperData.id,
                                                formId: updatedForm._id,
                                                formTypeChanged:
                                                  mapperData.formType !==
                                                  updatedForm.type,
                                                titleChanged:
                                                  mapperData.formName !==
                                                  updatedForm.title,
                                              };

                                              const isMapperNeed =
                                                isMapperSaveNeeded(
                                                  mapperData,
                                                  updatedForm,
                                                  applicationCount
                                                );

                                              if (isMapperNeed === "new") {
                                                data["version"] = String(
                                                  +mapperData.version + 1
                                                );
                                                dispatch(
                                                  saveFormProcessMapperPost(
                                                    data
                                                  )
                                                );
                                              } else if (
                                                isMapperNeed === "update"
                                              ) {
                                                dispatch(
                                                  saveFormProcessMapperPut(data)
                                                );
                                              }
                                              fetchForms();
                                              dispatch(
                                                updateFormUploadCounter()
                                              );
                                              resolve();
                                            })
                                            .catch((err) => {
                                              dispatch(
                                                setFormFailureErrorData(
                                                  "form",
                                                  err
                                                )
                                              );
                                              dispatch(
                                                formUploadFailureCount()
                                              );
                                              reject();
                                            });
                                        } else {
                                          reject();
                                          toast.error(
                                            "Error in submission count"
                                          );
                                        }
                                      }
                                    )
                                  );
                                })
                                .catch(() => {
                                  dispatch(DesignerAccessDenied(true));
                                  dispatch(formUploadFailureCount());
                                  reject();
                                });
                            } else if (!mapperData) {
                              newFormData.componentChanged = true;
                              newFormData.newVersion = true;
                              newFormData.path += "-" + Date.now();
                              newFormData.name += "-" + Date.now();
                              formCreate(newFormData)
                                .then((res) => {
                                  if (res.data) {
                                    mapperHandler(res.data);
                                    // call the auth api
                                    setDefaultAuthorization(res.data._id);
                                  }
                                  dispatch(updateFormUploadCounter());
                                  resolve();
                                })
                                .catch((err) => {
                                  err ? dispatch(formUploadFailureCount()) : "";
                                  reject();
                                });
                            } else {
                              toast.error(err);
                              reject();
                            }
                          })
                        );
                      } else {
                        dispatch(formUploadFailureCount());
                        reject();
                      }
                    })
                  );
                });
            });
          })
        );
      }
    } catch (err) {
      err ? dispatch(formUploadFailureCount()) : "";
    }
  };

  const fileUploaded = async (evt) => {
    FileService.uploadFile(evt, async (fileContent) => {
      let formToUpload;
      if ("forms" in fileContent) {
        if (Array.isArray(fileContent.forms)) {
          formToUpload = fileContent;
        } else {
          const resourcesArray = Object.entries(fileContent.resources);
          const formsData = Object.entries(fileContent.forms).concat(
            resourcesArray
          );
          const formsArray = formsData.map(([, value]) => value);
          formToUpload = { forms: formsArray };
        }
      } else {
        const keysToRemove = ["_id", "created", "modified", "machineName"];
        let newArray = [];
        if (Array.isArray(fileContent)) {
          newArray = fileContent.map((obj) => {
            const newObj = { ...obj };
            keysToRemove.forEach((key) => delete newObj[key]);
            return newObj;
          });
        } else {
          keysToRemove.forEach((e) => delete fileContent[e]);
          newArray.push(fileContent);
        }
        formToUpload = { forms: newArray };
      }

      if (formToUpload) {
        dispatch(setFormUploadList(formToUpload?.forms || []));
        setShowFormUploadModal(true);
        await uploadFileContents(formToUpload);
        fetchForms();
      }
    });
  };

  return (
    <>
      <FileModal
        modalOpen={showFormUploadModal}
        onClose={() => setShowFormUploadModal(false)}
      />
      {(forms.isActive || designerFormLoading || isBPMFormListLoading) &&
        !searchFormLoading ? (
        <div data-testid="Form-list-component-loader">
          <Loading />
        </div>
      ) : (
        <div>
          <Confirm
            modalOpen={props.modalOpen}
            message={
              formProcessData.id && applicationCount ? (
                applicationCountResponse ? (
                  <div>
                    {applicationCount}
                    {applicationCount > 1 ? (
                      <span>{`${t(" Submissions are made against")} `}</span>
                    ) : (
                      <span>{`${t(" Submission is made against")} `}</span>
                    )}
                    <span style={{ fontWeight: "bold" }}>
                      {props.formName.includes(" ")
                        ? props.formName
                        : textTruncate(50, 40, props.formName)}
                    </span>
                    .<br /> <span>{`${t("Are you sure to delete the")} ${formProcessData.formType} `}</span> ?
                  </div>
                ) : (
                  <div>
                    <span>{`${t("Are you sure to delete the")} ${formProcessData.formType} `}</span>
                    <span style={{ fontWeight: "bold" }}>
                      {textTruncate(60, 40, props.formName)}
                    </span>
                    ?
                  </div>
                )
              ) : (
                <div>
                    <span>{`${t("Are you sure to delete the")} ${formProcessData.formType} `}</span>
                    <span style={{ fontWeight: "bold" }}>
                      {textTruncate(60, 40, props.formName)}
                    </span>
                    ?
                  </div>
              )
            }
            onNo={() => onNo()}
            onYes={(e) => {
              onYes(
                e,
                formId,
                formProcessData,
                formCheckList,
                applicationCount,
                fetchForms
              );
            }}
          />

          <Errors errors={errors} />
          <div className="d-flex">
            {isDesigner && (
              <>
                <button
                  onClick={() =>
                    dispatch(push(`${redirectUrl}formflow/create`))
                  }
                  className="btn btn-primary"
                  style={{ whiteSpace: "nowrap" }}
                >
                  <i className="fa fa-plus mr-2" />
                  <Translation>{(t) => t("Create Form")}</Translation>
                </button>
                <button
                  className="btn btn-outline-primary  ml-4"
                  onClick={uploadClick}
                  title={t("Upload json form only")}
                  style={{ whiteSpace: "nowrap" }}
                >
                  <i className="fa fa-upload mr-2" aria-hidden="true" />
                  {t("Upload Form")}
                </button>
                <input
                  type="file"
                  value=""
                  className="d-none"
                  multiple={false}
                  accept=".json,application/json"
                  onChange={(e) => {
                    fileUploaded(e);
                  }}
                  ref={uploadFormNode}
                />
              </>
            )}
          </div>
          {isDesigner ? (
            <>
              <div className="mt-4 d-md-flex  justify-content-between align-items-end">
                <Head items={headOptions} page={"Forms"} visibleHr={false} />

                <div className="d-flex flex-column flex-md-column justify-content-md-end mb-4">
                  {isDesigner && (
                    <button
                      className="btn btn-outline-primary "
                      onClick={downloadForms}
                      disabled={formCheckList.length === 0}
                    >
                      <i className="fa fa-download mr-2" aria-hidden="true" />
                      {t("Download Form")}
                    </button>
                  )}
                </div>
              </div>
              <hr style={{ marginTop: "-10px" }} />
            </>
          ) : (
            <Head items={headerList()} page={"Forms"} />
          )}

          {isDesigner ? <FormTable /> : !isDesigner ? <ClientTable /> : null}
        </div>
      )}
    </>
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
    tenants: selectRoot("tenants", state),
    path: selectRoot("formDelete", state).formDelete.path,
  };
};

// eslint-disable-next-line no-unused-vars
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onYes: (
      e,
      formId,
      formProcessData,
      formCheckList,
      applicationCount,
      fetchForms
    ) => {
      e.currentTarget.disabled = true;
      if (!applicationCount) {
        dispatch(deleteForm("form", formId));
      }
      if (formProcessData.id) {
        dispatch(
          unPublishForm(formProcessData.id, (err) => {
            if (err) {
              toast.error(
                <Translation>
                  {(t) => t("Form deletion unsuccessful")}
                </Translation>
              );
            } else {
              toast.success(
                <Translation>
                  {(t) => t("Form deleted successfully")}
                </Translation>
              );
              const newFormCheckList = formCheckList.filter(
                (i) => i.formId !== formId
              );
              dispatch(setFormCheckList(newFormCheckList));
            }
            fetchForms();
          })
        );
      }
      const formDetails = {
        modalOpen: false,
        formId: "",
        formName: "",
      };
      dispatch(setFormDeleteStatus(formDetails));
    },
    onNo: () => {
      const formDetails = { modalOpen: false, formId: "", formName: "" };
      dispatch(setFormDeleteStatus(formDetails));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(List);
