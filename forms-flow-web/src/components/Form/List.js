import React, { useEffect, useRef, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider from "react-bootstrap-table2-toolkit";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import _isEquial from "lodash/isEqual";
import { selectRoot, selectError, Errors, deleteForm } from "react-formio";
import Loading from "../../containers/Loading";
import {
  MULTITENANCY_ENABLED,
  STAFF_DESIGNER,
} from "../../constants/constants";
import "../Form/List.scss";
import {
  setFormFailureErrorData,
  setBPMFormLimit,
  setBPMFormListLoading,
  setBPMFormListPage,
  setBPMFormListSort,
  setFormDeleteStatus,
  setBpmFormType,
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
  formUploadFailureCount
} from "../../actions/checkListActions";
import FileModal from "./FileUpload/fileUploadModal";
import { useTranslation, Translation } from "react-i18next";
import { addHiddenApplicationComponent } from "../../constants/applicationComponent";
import LoadingOverlay from "react-loading-overlay";
import {
  getFormProcesses,
  saveFormProcessMapperPost,
  saveFormProcessMapperPut,
  unPublishForm,
  getApplicationCount,
} from "../../apiManager/services/processServices";
import { setBpmFormSearch } from "../../actions/formActions";
import { addTenantkey } from "../../helper/helper";
import { formCreate, formUpdate } from "../../apiManager/services/FormServices";
import { designerColums, getoptions, userColumns } from "./constants/table";
import paginationFactory from "react-bootstrap-table2-paginator";
import filterFactory from "react-bootstrap-table2-filter";
import overlayFactory from "react-bootstrap-table2-overlay";
import { SpinnerSVG } from "../../containers/SpinnerSVG";
import { getFormattedForm, INACTIVE } from "./constants/formListConstants";
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
  const searchInputBox = useRef("");
  const isBPMFormListLoading = useSelector((state) => state.bpmForms.isActive);
  const designerFormLoading = useSelector(
    (state) => state.formCheckList.designerFormLoading
  );
  const seachFormLoading = useSelector(
    (state) => state.formCheckList.searchFormLoading
  );
  const [showClearButton, setShowClearButton] = useState("");
  const [isAscend, setIsAscending] = useState(true);
  const searchText = useSelector((state) => state.bpmForms.searchText);
  const [searchTextInput, setSearchTextInput] = useState(searchText);
  const [isLoading, setIsLoading] = React.useState(false);

  const formType = useSelector((state) => state.bpmForms.formType);


  const isDesigner = userRoles.includes(STAFF_DESIGNER);
  const bpmForms = useSelector((state) => state.bpmForms);
  const pageNo = useSelector((state) => state.bpmForms.page);
  const limit = useSelector((state) => state.bpmForms.limit);
  const totalForms = useSelector((state) => state.bpmForms.totalForms);
  const sortBy = useSelector((state) => state.bpmForms.sortBy);
  const sortOrder = useSelector((state) => state.bpmForms.sortOrder);
  const formCheckList = useSelector((state) => state.formCheckList.formList);
  const columns = isDesigner ? designerColums(t) : userColumns(t);

  const formAccess = useSelector((state) => state.user?.formAccess || []);

  const submissionAccess = useSelector(
    (state) => state.user?.submissionAccess || []
  );

  const searchFormLoading = useSelector(
    (state) => state.formCheckList.searchFormLoading
  );
  const applicationCountResponse = useSelector(
    (state) => state.process.applicationCountResponse
  );
  const formProcessData = useSelector((state) => state.process.formProcessList);
  const applicationCount = useSelector(
    (state) => state.process.applicationCount
  );
  const tenantKey = tenants?.tenantId;
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";

  useEffect(() => {
    dispatch(setFormCheckList([]));
  }, [dispatch]);

  useEffect(() => {
    setIsLoading(false);
    dispatch(setBPMFormListLoading(true));
  }, []);
  const fetchForms = () => {
    setShowClearButton(searchText);
    let filters = [pageNo, limit, sortBy, sortOrder, searchText];
    if (isDesigner) {
      filters.push(formType);
    }
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
    formType
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
  const handlePageChange = (type, newState) => {
    dispatch(setBPMFormLimit(newState.sizePerPage));
    dispatch(setBPMFormListPage(newState.page));
  };
  const handleSearch = () => {
    if (searchText != searchInputBox.current.value) {
      searchInputBox.current.value === '' ? dispatch(setBPMFormLimit(5)) : '';
      dispatch(setBPMFormListPage(1));
      dispatch(setBpmFormSearch(searchInputBox.current.value));
    }
  };

  const handleTypeChange = (type) => {
    dispatch(setBPMFormListPage(1));
    dispatch(setBPMFormLimit(5));
    dispatch(setBpmFormType(type));
  };
  const onClear = () => {
    setSearchTextInput("");
    dispatch(setBpmFormSearch(''));
    dispatch(setBPMFormLimit(5));
    setShowClearButton(false);
  };
  useEffect(() => {
    const updatedQuery = isAscend ? "asc" : "desc";
    dispatch(setBPMFormListSort(updatedQuery));
  }, [isAscend]);
  const handleSort = () => {
    setIsAscending(!isAscend);
    dispatch(setBPMFormListPage(1));
    dispatch(setFormSearchLoading(true));
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
                              dispatch(
                                getApplicationCount(mapperData.id, (error, applicationCount) => {
                                  if (!error) {
                                    newFormData._id = formObj._id;
                                    newFormData.access = formObj.access;
                                    newFormData.submissionAccess = formObj.submissionAccess;
                                    newFormData.componentChanged =
                                      (!_isEquial(newFormData.components, formObj.components) ||
                                        newFormData.display !== formObj.display ||
                                        newFormData.type !== formObj.type
                                      );
                                    newFormData.parentFormId = mapperData.parentFormId;
                                    formUpdate(newFormData._id, newFormData)
                                      .then((formupdated) => {
                                        const updatedForm = formupdated.data;
                                        const data = {
                                          anonymous:
                                            mapperData.anonymous === null
                                              ? false
                                              : mapperData.anonymous,
                                          formName: updatedForm.title,
                                          formType: updatedForm.type,
                                          parentFormId: mapperData.parentFormId,
                                          status: mapperData.status
                                            ? mapperData.status
                                            : INACTIVE,
                                          taskVariable: mapperData.taskVariable
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

                                        const isMapperNeed = isMapperSaveNeeded(
                                          mapperData,
                                          updatedForm,
                                          applicationCount
                                        );

                                        if (isMapperNeed === "new") {
                                          data["version"] = String(
                                            +mapperData.version + 1
                                          );
                                          dispatch(
                                            saveFormProcessMapperPost(data)
                                          );
                                        } else if (isMapperNeed === "update") {
                                          dispatch(
                                            saveFormProcessMapperPut(data)
                                          );
                                        }
                                        fetchForms();
                                        dispatch(updateFormUploadCounter());
                                        resolve();
                                      })
                                      .catch((err) => {
                                        dispatch(
                                          setFormFailureErrorData("form", err)
                                        );
                                        dispatch(formUploadFailureCount());
                                        reject();
                                      });
                                  } else {
                                    reject();
                                    toast.error("Error in application count");
                                  }
                                })
                              );
                            } else if (!mapperData) {
                              newFormData.componentChanged = true;
                              newFormData.newVersion = true;
                              newFormData.path += "-" + Date.now();
                              newFormData.name += "-" + Date.now();
                              formCreate(newFormData)
                                .then((res) => {
                                  if (res.data) {
                                    mapperHandler(res.data);
                                  }
                                  dispatch(updateFormUploadCounter());
                                  resolve();
                                })
                                .catch((err) => {
                                  err ? dispatch(formUploadFailureCount()) : '';
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
      err ? dispatch(formUploadFailureCount()) : '';
    }
  };

  const fileUploaded = async (evt) => {
    FileService.uploadFile(evt, async (fileContent) => {
      let formToUpload;
      if ("forms" in fileContent) {
        formToUpload = fileContent;
      }
      else {
        ['_id', 'type', 'created', 'modified', 'machineName'].forEach(e => delete fileContent[e]);
        const newArray = [];
        newArray.push(fileContent);
        formToUpload = { "forms": newArray };
      }
      if (formToUpload) {
        dispatch(setFormUploadList(formToUpload?.forms || []));
        setShowFormUploadModal(true);
        await uploadFileContents(formToUpload);
        fetchForms();
      }
    });
  };

  const noDataFound = () => {
    return (
      <span>
        <div
          className="container"
          style={{
            maxWidth: "900px",
            margin: "auto",
            height: "50vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h3>{t("No forms found")}</h3>
          <p>{t("Please change the selected filters to view Forms")}</p>
        </div>
      </span>
    );
  };
  const formData = (() => bpmForms.forms)() || [];

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
        <div className="container">
          <Confirm
            modalOpen={props.modalOpen}
            message={
              formProcessData.id && applicationCount ? (
                applicationCountResponse ? (
                  
                 <div>
                 {applicationCount}  
                 {
                    applicationCount > 1
                      ? <span>{`${t(" Applications are submitted against")} `}</span> 
                      : <span>{`${t(" Application is submitted against")} `}</span> 
                  } 
                  <span style={{ fontWeight: "bold" }}>{props.formName}</span>
                  .
                   {t("Are you sure you wish to delete the form?")}
                  
                   </div>
                ) : (
                  <div>
                    {`${t("Are you sure you wish to delete the form ")}`}
                    <span style={{ fontWeight: "bold" }}>{props.formName}</span>
                    ?
                  </div>
                )
              ) : (
                <div>
                  {`${t("Are you sure you wish to delete the form ")} `}
                  <span style={{ fontWeight: "bold" }}>{props.formName}</span>
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
          <div className="flex-container">
            {/*<img src="/form.svg" width="30" height="30" alt="form" />*/}
            <div className="flex-item-left">
              <div style={{ display: "flex" }}>
                <h3 className="task-head" style={{ marginTop: "3px" }}>
                  <i className="fa fa-wpforms" aria-hidden="true" />
                </h3>
                <h3 className="task-head">
                  {" "}
                  <span className="forms-text" style={{ marginLeft: "1px" }}>
                    {t("Forms")}
                  </span>
                </h3>
              </div>
            </div>
            <div className="flex-item-right">
              {isDesigner && (
                <Link
                  to={`${redirectUrl}formflow/create`}
                  className="btn btn-primary btn-left btn-sm"
                >
                  <i className="fa fa-plus fa-lg" />{" "}
                  <Translation>{(t) => t("Create Form")}</Translation>
                </Link>
              )}
              {isDesigner && (
                <>
                  <Button
                    className="btn btn-primary btn-sm form-btn pull-right btn-left"
                    onClick={uploadClick}
                    title={t("Upload json form only")}
                  >
                    <i className="fa fa-upload fa-lg" aria-hidden="true" />{" "}
                    {t("Upload Form")}{" "}
                  </Button>
                  <input
                    type="file"
                    value=''
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
              {isDesigner && (
                <>
                  <button
                    className="btn btn-outline-primary pull-right btn-left "
                    onClick={downloadForms}
                    disabled={formCheckList.length === 0}
                  >
                    <i className="fa fa-download fa-lg" aria-hidden="true" />{" "}
                    {t("Download Form")}{" "}
                  </button>
                </>
              )}
            </div>
          </div>
          <section className="custom-grid grid-forms">
            <Errors errors={errors} />
            <div className="  row mt-2 mx-2">
              <div className="col" style={{ marginLeft: "5px", marginTop: "-18px" }}>
                <div className="input-group">
                  <span
                    className="sort-span"
                    onClick={handleSort}
                    style={{
                      cursor: "pointer",
                      marginBottom: "8px",
                    }}
                  >
                    <i
                      className="fa fa-long-arrow-up fa-lg mt-2 fa-lg-hover"
                      title={t("Sort by form name")}
                      style={{
                        opacity: `${sortOrder === "asc" || sortOrder === "title" ? 1 : 0.5
                          }`,
                      }}
                    />
                    <i
                      className="fa fa-long-arrow-down fa-lg mt-2 ml-1 fa-lg-hover"
                      title={t("Sort by form name")}
                      style={{
                        opacity: `${sortOrder === "desc" || sortOrder === "-title"
                          ? 1
                          : 0.5
                          }`,
                      }}
                    />
                  </span>
                  <div className="form-outline ml-3">
                    <input
                      type="search"
                      id="form1"
                      ref={searchInputBox}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      onChange={(e) => {
                        setShowClearButton(e.target.value);
                        setSearchTextInput(e.target.value);
                        e.target.value === "" && handleSearch();
                      }}
                      autoComplete="off"
                      className="form-control"
                      value={searchTextInput}
                      placeholder={t("Search...")}
                    />
                  </div>
                  {showClearButton && (
                    <button
                      type="button"
                      className="btn btn-outline-primary ml-2"
                      onClick={() => onClear()}
                    >
                      <i className="fa fa-times"></i>
                    </button>
                  )}
                  <button
                    type="button"
                    className='btn btn-outline-primary ml-2'
                    name="search-button"
                    title="Click to search"
                    onClick={() => handleSearch()}
                  >
                    <i className="fa fa-search" ></i>
                  </button>
                  {isDesigner ? (
                    <select
                      className="form-control select"
                      title={t("select form type")}
                      style={{ maxWidth: "150px" }}
                      onChange={(e) => {
                        handleTypeChange(e.target.value);
                      }}
                      aria-label="Select Form Type"
                    >
                      <option selected={formType === "form"} value="form">
                        {t("Form")}
                      </option>
                      <option
                        selected={formType === "resource"}
                        value="resource"
                      >
                        {t("Resource")}
                      </option>
                    </select>

                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
            <ToolkitProvider
              bootstrap4
              keyField="id"
              data={formData}
              columns={columns}
              search
            >
              {(props) => {
                return (
                  <div>
                    <LoadingOverlay
                      active={seachFormLoading}
                      spinner
                      text={t("Loading...")}
                    >
                      <BootstrapTable
                        remote={{
                          pagination: true,
                          filter: true,
                        }}
                        Loading={isLoading}
                        filter={filterFactory()}
                        filterPosition={"top"}
                        pagination={formData.length ? paginationFactory(
                          getoptions(pageNo, limit, totalForms)
                        ) : false}
                        onTableChange={handlePageChange}
                        {...props.baseProps}
                        noDataIndication={() => !seachFormLoading ? noDataFound() : ""}
                        overlay={overlayFactory({
                          spinner: <SpinnerSVG />,
                          styles: {
                            overlay: (base) => ({
                              ...base,
                              background: "rgba(255, 255, 255)",
                              height: `${limit > 5
                                ? "100% !important"
                                : "350px !important"
                                }`,
                              top: "65px",
                            }),
                          },
                        })}
                      />
                    </LoadingOverlay>
                  </div>
                );
              }}
            </ToolkitProvider>
          </section>
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
                  {(t) => t("Form delete unsuccessfull")}
                </Translation>
              );
            } else {
              toast.success(
                <Translation>{(t) => t("Form delete successfull")}</Translation>
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
