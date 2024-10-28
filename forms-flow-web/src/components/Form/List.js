import React, { useEffect, useState } from "react";
import { connect, useSelector, useDispatch } from "react-redux";
import CreateFormModal from "../Modals/CreateFormModal.js";
import ImportFormModal from "../Modals/ImportFormModal.js";
import { push } from "connected-react-router";
import { toast } from "react-toastify";
import { addTenantkey } from "../../helper/helper";
import { selectRoot, selectError, Errors, deleteForm } from "@aot-technologies/formio-react";
import Loading from "../../containers/Loading";
import {
  MULTITENANCY_ENABLED,
} from "../../constants/constants";
import "../Form/List.scss";
import {
  setBPMFormListLoading,
  setFormDeleteStatus,
  setBpmFormSearch,
  setBPMFormListPage,
} from "../../actions/formActions";
import {
  fetchBPMFormList
} from "../../apiManager/services/bpmFormServices";
import {
  setFormCheckList,
  setFormSearchLoading
} from "../../actions/checkListActions";
import { useTranslation, Translation } from "react-i18next";
import {
  unPublishForm,
} from "../../apiManager/services/processServices";
import FormTable from "./constants/FormTable";
import ClientTable from "./constants/ClientTable";
import _ from "lodash";
import { CustomButton } from "@formsflow/components"; 
import _camelCase from "lodash/camelCase";
import { formCreate, formImport,validateFormName } from "../../apiManager/services/FormServices";
import { setFormSuccessData } from "../../actions/formActions";
import { CustomSearch }  from "@formsflow/components";
import userRoles from "../../constants/permissions.js";
import FileService from "../../services/FileService";
import {FormBuilderModal} from "@formsflow/components";

 
const List = React.memo((props) => {
  const { createDesigns, createSubmissions, viewDesigns } = userRoles();
  const { t } = useTranslation();
  const searchText = useSelector((state) => state.bpmForms.searchText);
  const [search, setSearch] = useState(searchText || "");
  const [showBuildForm, setShowBuildForm] = useState(false);
  const [importFormModal, setImportFormModal] = useState(false);
  const [importError, setImportError] = useState("");
  const [importLoader, setImportLoader] = useState(false);
  const ActionType = {
    BUILD: "BUILD",
    IMPORT: "IMPORT"
  };

  const UploadActionType = {
    IMPORT: "import",
    VALIDATE: "validate"
  };

  // const [formDescription, setFormDescription] = useState("");
  const [nameError, setNameError] = useState("");
  const dispatch = useDispatch();
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const submissionAccess = useSelector((state) => state.user?.submissionAccess || []);

  const [formSubmitted, setFormSubmitted] = useState(false);

  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const [form, setFormData] = useState({display:"form", title:"", description:""});
  // const roleIds = useSelector((state) => state.user?.roleIds || {});
  useEffect(() => {
    setSearch(searchText);
  }, [searchText]);

  useEffect(() => {
    if (!search?.trim()) {
      dispatch(setBpmFormSearch(""));
    }
  }, [search]);
  const handleSearch = () => {
    dispatch(setBpmFormSearch(search));
    dispatch(setBPMFormListPage(1));
  };
  const handleClearSearch = () => {
    setSearch("");
    dispatch(setBpmFormSearch(""));
  };
  const {
    forms,
    getFormsInit,
    errors,
  } = props;
  const isBPMFormListLoading = useSelector((state) => state.bpmForms.isActive);
  const designerFormLoading = useSelector(
    (state) => state.formCheckList.designerFormLoading
  );

  const pageNo = useSelector((state) => state.bpmForms.page);
  const limit = useSelector((state) => state.bpmForms.limit);
  const formSort = useSelector((state) => state.bpmForms.sort);
  const formAccess = useSelector((state) => state.user?.formAccess || []);
  const searchFormLoading = useSelector(
    (state) => state.formCheckList.searchFormLoading
  );
  const [newFormModal, setNewFormModal] = useState(false);
  const [description, setUploadFormDescription] = useState("");
  const [formTitle, setFormTitle] = useState("");
  
  useEffect(() => {
    dispatch(setFormCheckList([]));
  }, [dispatch]);

  useEffect(() => {
    dispatch(setBPMFormListLoading(true));
  }, []);

  const fetchForms = () => {
    let filters = [pageNo, limit, formSort, searchText];
    dispatch(setFormSearchLoading(true));
    dispatch(fetchBPMFormList(...filters));
  };
  const onClose = () => {
    setNewFormModal(false);
  };
  const onCloseimportModal = () => {
    setImportError("");
    setImportFormModal(false);
  };
  const onCloseBuildModal = () => {
    setShowBuildForm(false);
    setNameError("");
    setFormSubmitted(false);
  };
  const handleAction = (actionType) => {
    switch (actionType) {
      case ActionType.BUILD:
        setShowBuildForm(true);
        break;
      case ActionType.IMPORT:
        setImportFormModal(true);
        break;
    }
    onClose();
  };

  const handleImport = async (fileContent, UploadActionType) => {
    setImportLoader(true);
    let data = {};
    switch (UploadActionType) {
      case "validate":
        data = {
          importType: "new",
          action: "validate",
        };
        break;
      case "import":
        setFormSubmitted(true);
        data = {
          importType: "new",
          action: "import",
        };
        break;
      default:
        console.error("Invalid UploadActionType provided");
        return;
    }

    const dataString = JSON.stringify(data);
    formImport(fileContent, dataString)
      .then((res) => {
        setImportLoader(false);
        setFormSubmitted(false);

        if (data.action == "validate") {
          FileService.extractFormDetails(fileContent, (formExtracted) => {
            if (formExtracted) {
              setFormTitle(formExtracted.formTitle);
              setUploadFormDescription(formExtracted.formDescription);
            } else {
              console.log("No valid form found.");
            }
          });
        }
        else {
          res?.data?.formId && dispatch(push(`${redirectUrl}formflow/${res.data.formId}/edit/`));
        }
      })
      .catch((err) => {
        setImportLoader(false);
        setFormSubmitted(false);
        setImportError(err?.response?.data?.message);
      });
  };


  useEffect(() => {
    fetchForms();
  }, [
    getFormsInit,
    dispatch,
    createDesigns,
    pageNo,
    limit,
    formSort,
    searchText,
  ]);

  const validateForm = () => {
    let errors = {};
    if (!form.title || form.title.trim() === "") {
      errors.title = "This field is required";
    }
    return errors;
  };

  const validateFormNameOnBlur = () => {
    if (!form.title || form.title.trim() === "") {
      setNameError("This field is required");
      return;
    }

    validateFormName(form.title)
      .then((response) => {
        const data = response?.data;
        if (data && data.code === "FORM_EXISTS") {
          setNameError(data.message);  // Set exact error message
        } else {
          setNameError("");
        }
      })
      .catch((error) => {
      const errorMessage = error.response?.data?.message || "An error occurred while validating the form name.";
      setNameError(errorMessage);  // Set the error message from the server
      console.error("Error validating form name:", errorMessage);
      });
  };

  const handleChange = (path, event) => {
    setFormSubmitted(false);
    const { target } = event;
    const value = target.type === "checkbox" ? target.checked : target.value;
    value == "" ? setNameError("This field is required") : setNameError("");
    setFormData(prev=>({...prev,[path]:value}));
  };

  const handleBuild = (formName,formDescription) => {
    // TBD: no need to pass formName and formDescription instead of that pass every data in handleChange
    setFormSubmitted(true);
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setNameError(errors.title);
      return;
    }

    const newForm = {
      ...form,
      tags: ["common"],
    };

    newForm.submissionAccess = submissionAccess;
    newForm.componentChanged = true;
    newForm.newVersion = true;
    newForm.access = formAccess;
    newForm.path = _camelCase(form.title).toLowerCase();
    newForm.name = _camelCase(form.title);
    newForm.description = formDescription;
    if (MULTITENANCY_ENABLED && tenantKey) {
        newForm.tenantKey = tenantKey;
        newForm.path = addTenantkey(newForm.path, tenantKey);
        newForm.name = addTenantkey(newForm.name, tenantKey);
    } 
    
    formCreate(newForm).then((res) => {
      const form = res.data;
      dispatch(setFormSuccessData("form", form));
      dispatch(push(`${redirectUrl}formflow/${form._id}/edit/`));

    }).catch((err) => {
      let error;
      if (err.response?.data) {
        error = err.response.data;
        console.log(error);
        setNameError(error?.errors?.name?.message);
      } else {
        error = err.message;
        setNameError(error?.errors?.name?.message);
      }
    }).finally(() => {
      setFormSubmitted(false);
    });
  };

  return (
    <>
      {(forms.isActive || designerFormLoading || isBPMFormListLoading) &&
        !searchFormLoading ? (
        <div data-testid="Form-list-component-loader">
          <Loading />
        </div>
      ) : (
        <div>
          <Errors errors={errors} />
          {createDesigns && (
            <>
              <div className="d-md-flex justify-content-between align-items-center pb-3 flex-wrap">
                <div className="d-md-flex align-items-center p-0 search-box input-group input-group width-25">

                  <CustomSearch
                    search={search}
                    setSearch={setSearch}
                    handleSearch={handleSearch}
                    handleClearSearch={handleClearSearch}
                    placeholder={t("Search Form Name and Description")}
                    searchLoading={searchFormLoading}
                    title={t("Search Form Name and Description")}
                    dataTestId="form-search-input"
                  />
                </div>
                <div className="d-md-flex justify-content-end align-items-center">
                  {createDesigns && (
                    <CustomButton
                      variant="primary"
                      size="sm"
                      label="New Form"
                      onClick={() => setNewFormModal(true)}
                      className=""
                      dataTestid="create-form-button"
                      ariaLabel="Create Form"
                    />
                  )}
                  <CreateFormModal
                    newFormModal={newFormModal}
                    actionType={ActionType}
                    onClose={onClose}
                    onAction={handleAction}
                  />
                  <FormBuilderModal
                    modalHeader="Build New Form"
                    nameLabel="Form Name"
                    descriptionLabel="Form Description"
                    showBuildForm={showBuildForm}
                    formSubmitted={formSubmitted}
                    onClose={onCloseBuildModal}
                    onAction={handleAction}
                    handleChange={handleChange}
                    primaryBtnAction={handleBuild}
                    setNameError={setNameError}
                    nameValidationOnBlur={validateFormNameOnBlur}
                    nameError={nameError}
                  />
                  <ImportFormModal
                    importLoader={importLoader}
                    importError={importError}
                    importFormModal={importFormModal}
                    uploadActionType={UploadActionType}
                    formName={formTitle}
                    formSubmitted={formSubmitted}
                    description={description}
                    onClose={onCloseimportModal}
                    handleImport={handleImport}
                  />
                </div>
              </div>

            </>
          )}

          {createDesigns || viewDesigns ? <FormTable /> :
            createSubmissions ? <ClientTable /> : null}
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
                  {(t) => t(`${_.capitalize(formProcessData?.formType)} deletion unsuccessful`)}
                </Translation>
              );
            } else {
              toast.success(
                <Translation>
                  {(t) => t(`${_.capitalize(formProcessData?.formType)} deleted successfully`)}
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
