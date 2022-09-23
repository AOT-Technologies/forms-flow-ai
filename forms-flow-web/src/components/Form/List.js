import React, { useEffect, useRef, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider from "react-bootstrap-table2-toolkit";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import {
  indexForms,
  selectRoot,
  selectError,
  Errors,
  deleteForm,
  Formio,
  saveForm,
} from "react-formio";
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
} from "../../actions/formActions";
import Confirm from "../../containers/Confirm";
import {
  fetchBPMFormList,
  fetchFormByAlias,
} from "../../apiManager/services/bpmFormServices";
import FileService from "../../services/FileService";
import {
  setFormCheckList,
  setFormLoading,
  setFormSearchLoading,
  setFormUploadList,
  updateFormUploadCounter,
} from "../../actions/checkListActions";
import FileModal from "./FileUpload/fileUploadModal";
import { useTranslation, Translation } from "react-i18next";
import { addHiddenApplicationComponent } from "../../constants/applicationComponent";
import LoadingOverlay from "react-loading-overlay";
import { unPublishForm } from "../../apiManager/services/processServices";
import { setBpmFormSearch } from "../../actions/formActions";
import { checkAndAddTenantKey } from "../../helper/helper";
import { formCreate } from "../../apiManager/services/FormServices";
import { designerColums, getoptions, userColumns } from "./constants/table";
import paginationFactory from "react-bootstrap-table2-paginator";
import filterFactory from "react-bootstrap-table2-filter";
import overlayFactory from "react-bootstrap-table2-overlay";
import { SpinnerSVG } from "../../containers/SpinnerSVG";
import { getFormioRoleIds } from "../../apiManager/services/userservices";

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
    path,
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
  const [isAscend, setIsAscending] = useState(false);
  const [previousForms, setPreviousForms] = useState({});
  const [isLoading, setIsLoading] = React.useState(false);

   const query = useSelector((state) => state.forms.query);
  const isDesigner = userRoles.includes(STAFF_DESIGNER);
  const bpmForms = useSelector((state) => state.bpmForms);
  const searchText = useSelector((state) => state.bpmForms.searchText);
  const pageNo = useSelector((state) => state.bpmForms.page);
  const limit = useSelector((state) => state.bpmForms.limit);
  const totalForms = useSelector((state) => state.bpmForms.totalForms);
  const sortBy = useSelector((state) => state.bpmForms.sortBy);
  const sortOrder = useSelector((state) => state.bpmForms.sortOrder);
  const formCheckList = useSelector((state) => state.formCheckList.formList);
  const columns = isDesigner ? designerColums(t) : userColumns(t);
  const designerPage = forms.pagination.page;
  const designerLimit = forms.limit;
  const designTotalForms = forms.pagination.total;
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
    if (forms.forms.length > 0) {
      setPreviousForms(forms);
    }
  }, [forms]);

  useEffect(() => {
    setIsLoading(false);
    if (isDesigner) {
      dispatch(setFormLoading(true));
    } else {
      dispatch(setBPMFormListLoading(true));
      dispatch(setBpmFormSearch(""));
    }
  }, []);

  useEffect(() => {
    if (isDesigner) {

      setShowClearButton(searchText);
      let updatedQuery = { query: { ...query } };
      updatedQuery.query.title__regex = searchText;
      updatedQuery.sort = sortOrder;

      getFormsInit(1, updatedQuery);
    } else {
      setShowClearButton(searchText);
      dispatch(fetchBPMFormList(pageNo, limit, sortBy, sortOrder, searchText));
    }

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


  const downloadForms = () => {
    FileService.downloadFile({ forms: formCheckList }, () => {
      toast.success(
        `${formCheckList.length} ${formCheckList.length === 1 ? t("Form") : t("Forms")
        } ${t("Downloaded Successfully")}`
      );
      dispatch(setFormCheckList([]));
    });
  };

  const uploadClick = (e) => {
    dispatch(setFormUploadList([]));
    e.preventDefault();
    uploadFormNode.current?.click();
    return false;
  };
  const handlePageChange = (type, newState) => {
    let modifiedPage;
    dispatch(setFormSearchLoading(true));
    let updatedQuery = { query: { ...query } };
    if (isDesigner) {
      dispatch(
        indexForms(
          "forms",
          modifiedPage ? modifiedPage : newState.page,
          { limit: newState.sizePerPage, ...updatedQuery },
          () => {
            dispatch(setFormSearchLoading(false));
          }
        )
      );
    } else {
      dispatch(setBPMFormLimit(newState.sizePerPage));
      dispatch(setBPMFormListPage(newState.page));
    }
  };
  const handleSearch = () => {
    if (searchText != searchInputBox.current.value) {
      dispatch(setBPMFormListPage(1));
      dispatch(setFormSearchLoading(true));
      dispatch(setBpmFormSearch(searchInputBox.current.value));
    }

  };
  const onClear = () => {
    dispatch(setFormSearchLoading(true));
    searchInputBox.current.value = "";
    setShowClearButton(false);
    handleSearch();
  };
  const handleSort = () => {
    dispatch(setBPMFormListPage(1));
    dispatch(setFormSearchLoading(true));
    setIsAscending(!isAscend);
    let updatedQuery = { query: { ...query } };
    if (isDesigner) {
      updatedQuery = `${isAscend ? "-" : ""}title`;
      dispatch(setBPMFormListSort(updatedQuery));
    } else {
      const updatedQuery = isAscend ? 'asc' : "desc";

      dispatch(setBPMFormListSort(updatedQuery));

    }

  };

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
                formData.path = checkAndAddTenantKey(formData.path, tenantKey);
                formData.name = checkAndAddTenantKey(formData.name, tenantKey);
              }
              const newFormData = {
                ...formData,
                tags: ["common"],
                ...tenantDetails,
              };
              newFormData.access = formAccess;
              newFormData.submissionAccess = submissionAccess;
              formCreate(newFormData, (err) => {
                Formio.cache = {}; //removing cache
                if (err) {
                  // get the form Id of the form if exists already in the server
                  dispatch(
                    fetchFormByAlias(newFormData.path, async (err, formObj) => {
                      if (!err) {
                        newFormData._id = formObj._id;
                        newFormData.access = formObj.access;
                        newFormData.submissionAccess = formObj.submissionAccess;
                        // newFormData.tags = formObj.tags;
                        dispatch(
                          saveForm(
                            "form",
                            newFormData,
                            (newFormData,
                              (err) => {
                                if (!err) {
                                  dispatch(updateFormUploadCounter());
                                  resolve();
                                } else {
                                  dispatch(setFormFailureErrorData("form", err));
                                  toast.error(t("Error in JSON file structure"));
                                  setShowFormUploadModal(false);
                                  reject();
                                }
                              })
                          )
                        );
                      } else {
                        toast.error(t("Error in JSON file structure"));
                        setShowFormUploadModal(false);
                        reject();
                      }
                    })
                  );
                } else {
                  dispatch(updateFormUploadCounter());
                  resolve();
                }
              });
            });
          })
        );
      } else {
        setShowFormUploadModal(false);
        return toast.error(t("Error in JSON file structure"));
      }
    } catch (err) {
      setShowFormUploadModal(false);
      return toast.error(t("Error in JSON file structure"));
    }
  };

  const fileUploaded = async (evt) => {
    FileService.uploadFile(evt, async (fileContent) => {
      dispatch(setFormUploadList(fileContent?.forms || []));
      setShowFormUploadModal(true);
      await uploadFileContents(fileContent);
      dispatch(indexForms("forms", 1, forms.query));
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
  const formData =
    (() =>
      isDesigner
        ? forms.forms.length || !searchFormLoading
          ? forms.forms
          : previousForms.forms
        : bpmForms.forms)() || [];

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
              formProcessData.id && applicationCount
                ? applicationCountResponse
                  ? `${applicationCount} ${applicationCount > 1
                    ? `${t("Applications are submitted against")}`
                    : `${t("Application is submitted against")}`
                  } "${props.formName}". ${t(
                    "Are you sure you wish to delete the form?"
                  )}`
                  : `${t("Are you sure you wish to delete the form ")} "${props.formName
                  }"?`
                : `${t("Are you sure you wish to delete the form ")} "${props.formName
                }"?`
            }
            onNo={() => onNo()}
            onYes={(e) => {
              onYes(e, formId, forms, formProcessData, path, formCheckList);
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
                    className="d-none"
                    multiple={false}
                    accept=".json,application/json"
                    onChange={fileUploaded}
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
            <div className="  row mt-2 mx-2" >
              <div className="col" style={{ marginLeft: "5px" }}>
                <div className="input-group">
                  <span
                    className="sort-span"
                    onClick={handleSort}
                    style={{
                      cursor: "pointer",
                      marginBottom: "8px"
                    }}>
                    <i
                      className="fa fa-long-arrow-up fa-lg mt-2 fa-lg-hover"
                      title="Sort by form name"
                      style={{
                        opacity: `${sortOrder === "asc" || sortOrder === "title" ? 1 : 0.5}`,
                      }}
                    />
                    <i
                      className="fa fa-long-arrow-down fa-lg mt-2 ml-1 fa-lg-hover"
                      title="Sort by form name"
                      style={{
                        opacity: `${sortOrder === "desc" || sortOrder === "-title" ? 1 : 0.5}`,
                      }}
                    />
                  </span>
                  <div className="form-outline ml-3">
                    <input
                      type="search"
                      id="form1"
                      ref={searchInputBox}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSearch()
                      }
                      onChange={(e) => {
                        setShowClearButton(e.target.value);
                        e.target.value === "" && handleSearch();
                      }}
                      autoComplete="off"
                      className="form-control"
                      placeholder={t(searchText ? searchText : "Search...")}
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
                    className="btn btn-outline-primary ml-2"
                    name="search-button"
                    title={t("Click to search")}
                    onClick={() => handleSearch()}
                  >
                    <i className="fa fa-search"></i>
                  </button>
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
                        pagination={paginationFactory(
                          getoptions(
                            isDesigner ? designerPage : pageNo,
                            isDesigner ? designerLimit : limit,
                            isDesigner ? designTotalForms : totalForms
                          )
                        )}
                        onTableChange={handlePageChange}
                        {...props.baseProps}
                        noDataIndication={() => noDataFound()}
                        overlay={overlayFactory({
                          spinner: <SpinnerSVG />,
                          styles: {
                            overlay: (base) => ({
                              ...base,
                              background: "rgba(255, 255, 255)",
                              height: `${isDesigner
                                ? designerLimit
                                : limit > 5
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

const getInitForms = (page = 1, query) => {
  return (dispatch, getState) => {
    const state = getState();
    const currentPage = state.forms.pagination.page;

    const maintainPagination = state.bpmForms.maintainPagination;
    dispatch(
      indexForms(
        "forms",
        maintainPagination ? currentPage : page,
        query,
        () => {
          dispatch(setFormLoading(false));
          dispatch(setFormSearchLoading(false));
        }
      )
    );

    // const maintainPagination = state.bpmForms.maintainPagination;
    // need to reduce calling the indexforms
    function fetchForms() {
      dispatch(
        indexForms("forms", page ? page : currentPage, query, (err) => {
          if (err === "Bad Token" || err === "Token Expired") {
            dispatch(
              getFormioRoleIds((err) => {
                if (!err) {
                  fetchForms();
                }
                dispatch(setFormLoading(false));
              })
            );
          } else {
            dispatch(setFormLoading(false));
          }
        })
      );
    }
    fetchForms();
  };
};

// eslint-disable-next-line no-unused-vars
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    getForms: (page, query) => {
      dispatch(indexForms("forms", page, query));
    },
    getFormsInit: (page, query) => {
      dispatch(getInitForms(page, query));
    },

    onYes: (e, formId, forms, formData, path, formCheckList) => {
      e.currentTarget.disabled = true;
      dispatch(
        deleteForm("form", formId, (err) => {
          if (!err) {
            toast.success(
              <Translation>{(t) => t("Form deleted successfully")}</Translation>
            );
            dispatch(indexForms("forms", 1, forms.query));
            if (formData.id) {
              dispatch(unPublishForm(formData.id));
              const newFormCheckList = formCheckList.filter(
                (i) => i.path !== path
              );
              dispatch(setFormCheckList(newFormCheckList));
            }
          } else {
            toast.error(
              <Translation>{(t) => t("Form delete unsuccessfull")}</Translation>
            );
          }
          const formDetails = {
            modalOpen: false,
            formId: "",
            formName: "",
          };
          dispatch(setFormDeleteStatus(formDetails));
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
