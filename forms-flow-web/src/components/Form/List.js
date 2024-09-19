import React, { useEffect, useState, useReducer } from "react";
import { connect, useSelector, useDispatch } from "react-redux";
import CreateFormModal from "../Modals/CreateFormModal.js";
import BuildFormModal from '../Modals/BuildFormModal';
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
import Button from "../CustomComponents/Button";
import _set from "lodash/set";
import _cloneDeep from "lodash/cloneDeep";
import _camelCase from "lodash/camelCase";
import { formCreate } from "../../apiManager/services/FormServices";
import { addHiddenApplicationComponent } from "../../constants/applicationComponent";
import { setFormSuccessData } from "../../actions/formActions";
import { handleAuthorization } from "../../apiManager/services/authorizationService";
import { saveFormProcessMapperPost } from "../../apiManager/services/processServices";
import { CustomSearch }  from "@formsflow/components";
import userRoles from "../../constants/permissions.js";



const reducer = (form, { type, value }) => {
  const formCopy = _cloneDeep(form);
  switch (type) {
    case "formChange":
      for (let prop in value) {
        if (Object.prototype.hasOwnProperty.call(value, prop)) {
          form[prop] = value[prop];
        }
      }
      return form;
    case "replaceForm":
      return _cloneDeep(value);
    case "title":
      if (type === "title" && !form._id) {
        formCopy.name = _camelCase(value);
        formCopy.path = _camelCase(value).toLowerCase();
      }
      break;
    default:
      break;
  }
  _set(formCopy, type, value);
  return formCopy;
};

const List = React.memo((props) => {
  const { createDesigns, createSubmissions, viewDesigns } = userRoles();
  const { t } = useTranslation();
  const searchText = useSelector((state) => state.bpmForms.searchText);
  const [search, setSearch] = useState(searchText || "");
  const [showBuildForm, setShowBuildForm] = useState(false);
  const [importFormModal, SetImportFormModal] = useState(false);
  const ActionType = {
    BUILD: "BUILD",
    IMPORT: "IMPORT"
  };
  const [formDescription, setFormDescription] = useState("");
  const [nameError, setNameError] = useState("");
  const dispatch = useDispatch();
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const submissionAccess = useSelector((state) => state.user?.submissionAccess || []);
  const formAccess = useSelector((state) => state.user?.formAccess || []);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const formData = { display: "form" }; const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const [form, dispatchFormAction] = useReducer(reducer, _cloneDeep(formData));
  const roleIds = useSelector((state) => state.user?.roleIds || {});
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
  const sortBy = useSelector((state) => state.bpmForms.sortBy);
  const sortOrder = useSelector((state) => state.bpmForms.sortOrder);
  const searchFormLoading = useSelector(
    (state) => state.formCheckList.searchFormLoading
  );
  const [newFormModal, setNewFormModal] = useState(false);

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
  const onClose = () => {
    setNewFormModal(false);
  };
  const onCloseimportModal = () => {
    SetImportFormModal(false);
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
        SetImportFormModal(true);
        break;
    }
    onClose();
  };

  const uploadAction = () => {
    //write the form upload action here
  };
  useEffect(() => {
    fetchForms();
  }, [
    getFormsInit,
    dispatch,
    createDesigns,
    pageNo,
    limit,
    sortBy,
    sortOrder,
    searchText,
  ]);

  const validateForm = () => {
    let errors = {};
    if (!form.title || form.title.trim() === "") {
      errors.title = "This field is required";
    }
    return errors;
  };

  const handleChange = (path, event) => {
    setFormSubmitted(false);
    const { target } = event;
    const value = target.type === "checkbox" ? target.checked : target.value;
    value == "" ? setNameError("This field is required") : setNameError("");
    dispatchFormAction({ type: path, value });
  };

  const handleBuild = () => {
    setFormSubmitted(true);
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setNameError(errors.title);
      return;
    }

    const newFormData = addHiddenApplicationComponent(form);
    const newForm = {
      ...newFormData,
      tags: ["common"],
    };
    newForm.submissionAccess = submissionAccess;
    newForm.componentChanged = true;
    newForm.newVersion = true;
    newForm.access = formAccess;
    if (MULTITENANCY_ENABLED && tenantKey) {
      newForm.tenantKey = tenantKey;
      if (newForm.path) {
        newForm.path = addTenantkey(newForm.path, tenantKey);
      }
      if (newForm.name) {
        newForm.name = addTenantkey(newForm.name, tenantKey);
      }
    }
    formCreate(newForm).then((res) => {
      const form = res.data;
      const data = {
        formId: form._id,
        formName: form.title,
        description: formDescription,
        formType: form.type,
        formTypeChanged: true,
        anonymousChanged: true,
        parentFormId: form._id,
        titleChanged: true,
        formRevisionNumber: "V1", // to do
        anonymous: formAccess[0]?.roles.includes(roleIds.ANONYMOUS),
      };
      let payload = {
        resourceId: data.formId,
        resourceDetails: {},
        roles: []
      };
      dispatch(setFormSuccessData("form", form));
      handleAuthorization(
        { application: payload, designer: payload, form: payload },
        data.formId
      ).catch((err) => {
        console.log(err);
      });
      dispatch(
        saveFormProcessMapperPost(data, (err) => {
          if (!err) {
            dispatch(push(`${redirectUrl}formflow/${form._id}/edit/`));
          } else {
            setFormSubmitted(false);
            console.log(err);
          }
        })
      );

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
              <div className="d-md-flex align-items-center p-0 search-box input-group input-group w-50">

    <CustomSearch
      search={search}
      setSearch={setSearch}
      handleSearch={handleSearch}
      handleClearSearch={handleClearSearch}
      placeholder={t("Search Form Name and Description")}
      searchFormLoading={searchFormLoading}
      title={t("Search Form Name and Description")}
      dataTestId="form-search-input"
    />
  </div>
  <div className="d-md-flex justify-content-end align-items-center">
    {createDesigns && (
      <Button
        variant="primary"
        size="md"
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
    <BuildFormModal
      showBuildForm={showBuildForm}
      formSubmitted={formSubmitted}
      onClose={onCloseBuildModal}
      onAction={handleAction}
      handleChange={handleChange}
      handleBuild={handleBuild}
      setFormDescription={setFormDescription}
      setNameError={setNameError}
      nameError={nameError}
    />
    <ImportFormModal
      importFormModal={importFormModal}
      onClose={onCloseimportModal}
      uploadAction={uploadAction}
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
