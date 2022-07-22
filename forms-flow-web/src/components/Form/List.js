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
  FORM_ACCESS,
  MULTITENANCY_ENABLED,
  STAFF_DESIGNER,
  SUBMISSION_ACCESS,
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
import {
  designerColums,
  getoptions,
  userColumns,
} from "./constants/table";
import paginationFactory from "react-bootstrap-table2-paginator";
import filterFactory from "react-bootstrap-table2-filter";
import overlayFactory from "react-bootstrap-table2-overlay";
import { SpinnerSVG } from "../../containers/SpinnerSVG";
import { ASCENDING,DESCENDING } from "./constants/formListConstants";

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

  const isBPMFormListLoading = useSelector((state) => state.bpmForms.isActive);
  const designerFormLoading = useSelector(
    (state) => state.formCheckList.designerFormLoading
  );
  const seachFormLoading = useSelector(
    (state) => state.formCheckList.searchFormLoading
  );
  const bpmForms = useSelector((state) => state.bpmForms);
  const [previousForms, setPreviousForms] = useState({});
  // View submissions feature will be deprecated in the future releases.

  // const showViewSubmissions = useSelector((state) => state.user.showViewSubmissions);
  const query = useSelector((state) => state.forms.query);
  const isDesigner = userRoles.includes(STAFF_DESIGNER);
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
  const sort = useSelector((state) => state.forms.sort);

  const isAscending = isDesigner ? !sort.match(/^-/g) : null;
  const tenantKey = tenants?.tenantId;
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const [isLoading, setIsLoading] = React.useState(false);
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
    }
  }, []);

  useEffect(() => {
    if (isDesigner) {
      getFormsInit(1);
    } else {
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
        `${formCheckList.length} ${
          formCheckList.length === 1 ? t("Form") : t("Forms")
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
    dispatch(setFormSearchLoading(true));
    let updatedQuery = {query:{...query}};
    if (type === "sort") {
      if (isDesigner) {
        updatedQuery.sort = `${isAscending ? "-" : ""}title`;
      }else{
        let updatedSort;
      if (sortOrder === ASCENDING) {
        updatedSort = DESCENDING;
        dispatch(setBPMFormListSort(updatedSort));
      } else {
        updatedSort = ASCENDING;
        dispatch(setBPMFormListSort(updatedSort));
      }
      }
    }else if (type === "filter") {
      let searchTitle = Object.keys(newState.filters).length
        ? newState.filters.title.filterVal
        : "";
      if (isDesigner) {
        updatedQuery.query.title__regex = searchTitle;
      } else {
        dispatch(setBpmFormSearch(searchTitle));
      }
    }

    if (isDesigner) {
      dispatch(
        indexForms(
          "forms",
          newState.page,
          { limit: newState.sizePerPage ,...updatedQuery},
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
              newFormData.access = FORM_ACCESS;
              newFormData.submissionAccess = SUBMISSION_ACCESS;
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
                                toast.error("Error in Json file structure");
                                setShowFormUploadModal(false);
                                reject();
                              }
                            })
                          )
                        );
                      } else {
                        toast.error("Error in Json file structure");
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
      return toast.error("Error in Json file structure");
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
                  ? `${applicationCount} ${
                      applicationCount > 1
                        ? `${t("Applications are submitted against")}`
                        : `${t("Application is submitted against")}`
                    } "${props.formName}". ${t(
                      "Are you sure you wish to delete the form?"
                    )}`
                  : `${t("Are you sure you wish to delete the form ")} "${
                      props.formName
                    }"?`
                : `${t("Are you sure you wish to delete the form ")} "${
                    props.formName
                  }"?`
            }
            onNo={() => onNo()}
            onYes={(e) => {
              onYes(e,formId, forms, formProcessData, path, formCheckList);
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
                          sort: true,
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
                              height: `${
                                isDesigner
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
        }
      )
    );
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

    onYes: (e,formId, forms, formData, path, formCheckList) => {
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
