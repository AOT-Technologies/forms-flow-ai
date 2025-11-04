import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect, useSelector, useDispatch } from "react-redux";
import CreateFormModal from "../../../components/Modals/CreateFormModal.js";
import { toast } from "react-toastify";
import { addTenantkey } from "../../../helper/helper";
import {
  selectRoot,
  deleteForm,
} from "@aot-technologies/formio-react";
import Loading from "../../../containers/Loading";
import { MULTITENANCY_ENABLED, MAX_FILE_SIZE } from "../../../constants/constants";
import {
  setBPMFormListLoading,
  setFormDeleteStatus,
  setBpmFormSearch,
  setBPMFormListPage,
  setBpmFormSort,
  setFormSuccessData
} from "../../../actions/formActions";
import {
  setFormCheckList,
} from "../../../actions/checkListActions";
import { useTranslation, Translation } from "react-i18next";
import { unPublishForm } from "../../../apiManager/services/processServices";
import FormListGrid from "../../../components/Form/FormListGrid";
import _ from "lodash";
import _camelCase from "lodash/camelCase";
import {
  formCreate,
  formImport,
  validateFormName,
} from "../../../apiManager/services/FormServices";
import userRoles from "../../../constants/permissions.js";
import FileService from "../../../services/FileService";
import {
  FormBuilderModal,
  ImportModal,
  CustomSearch,
  CustomButton,
  useSuccessCountdown,
  V8CustomButton,
  Alert,
  AlertVariant,
  CustomProgressBar
} from "@formsflow/components";
import { useMutation } from "react-query";
import { addHiddenApplicationComponent } from "../../../constants/applicationComponent";
import { navigateToDesignFormEdit, navigateToDesignFormBuild, navigateToFormEntries } from "../../../helper/routerHelper.js";
import FilterSortActions from "../../../components/CustomComponents/FilterSortActions.js";

const List = React.memo((props) => {
  const { createDesigns, createSubmissions, viewDesigns } = userRoles();
  const { t } = useTranslation();
  const searchText = useSelector((state) => state.bpmForms.searchText);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const [search, setSearch] = useState(searchText || "");
  const [showBuildForm, setShowBuildForm] = useState(false);
  const [importFormModal, setImportFormModal] = useState(false);
  const [importError, setImportError] = useState("");
  const [importLoader, setImportLoader] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const { successState, startSuccessCountdown } = useSuccessCountdown();
  const [isDuplicating] = useState(false);
  const [duplicateProgress] = useState(0);


  const handleFilterIconClick = () => {
    setShowSortModal(true); // Open the SortModal
  };

  const handleSortModalClose = () => {
    setShowSortModal(false); // Close the SortModal
  };

  const handleSortApply = (selectedSortOption, selectedSortOrder) => {
    const resetSortOrders = optionSortBy.reduce((acc, option) => {
      acc[option.value] = { sortOrder: "asc" };
      return acc;
    }, {});
    dispatch(
      setBpmFormSort({
        ...resetSortOrders,
        activeKey: selectedSortOption,
        [selectedSortOption]: { sortOrder: selectedSortOrder },
      })
    );
    setShowSortModal(false);
  };

  const ActionType = {
    BUILD: "BUILD",
    IMPORT: "IMPORT",
  };

  const UploadActionType = {
    IMPORT: "import",
    VALIDATE: "validate",
  };

  const [nameError, setNameError] = useState("");
  const dispatch = useDispatch();
  const submissionAccess = useSelector(
    (state) => state.user?.submissionAccess || []
  );

  const [formSubmitted, setFormSubmitted] = useState(false);

  /* --------- validate form title exist or not --------- */
  const {
    mutate: validateFormTitle, // this function will trigger the API call
    isLoading: validationLoading,
    // isError: error,
  } = useMutation(({ title }) => validateFormName(title), {
    onSuccess: ({ data }, { createButtonClicked, ...variables }) => {
      if (data && data.code === "FORM_EXISTS") {
        setNameError(data.message); // Set exact error message
      } else {
        setNameError("");
        // if the modal clicked createButton, need to call handleBuild
        if (createButtonClicked) {
          handleBuild(variables);
        }
      }
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        "An error occurred while validating the form name.";
      setNameError(errorMessage); // Set the error message from the server
    },
  });

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
  // const handleClearSearch = () => {
  //   setSearch("");
  //   dispatch(setBpmFormSearch(""));
  // };
  const { forms } = props;
  const isBPMFormListLoading = useSelector((state) => state.bpmForms.isActive);
  const designerFormLoading = useSelector(
    (state) => state.formCheckList.designerFormLoading
  );

  const formSort = useSelector((state) => state.bpmForms.sort);
  const formAccess = useSelector((state) => state.user?.formAccess || []);
  const searchFormLoading = useSelector(
    (state) => state.formCheckList.searchFormLoading
  );
  const [newFormModal, setNewFormModal] = useState(false);
  const [description, setDescription] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const  optionSortBy = [
    { value: "formName", label: t("Form Name") },
    { value: "visibility", label: t("Visibility") },
    { value: "status", label: t("Status") },
    { value: "modified", label: t("Last Edited") },
  ];
  useEffect(() => {
    dispatch(setFormCheckList([]));
  }, [dispatch]);

  useEffect(() => {
    dispatch(setBPMFormListLoading(true));
  }, []);

  // Fetching is now handled by FormListGrid
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

  const handleImport = async (fileContent, actionType) => {

    if (fileContent.size > MAX_FILE_SIZE) {
      setImportError(
        `File size exceeds the ${
          MAX_FILE_SIZE / (1024 * 1024)
        }MB limit. Please upload a smaller file.`
      );
      return;
    }

    let data;
    if (
      [UploadActionType.VALIDATE, UploadActionType.IMPORT].includes(actionType)
    ) {
      data = { importType: "new", action: actionType };
    } else {
      console.error("Invalid UploadActionType provided");
      return;
    }

    if (actionType === UploadActionType.IMPORT) {
      setImportLoader(true);
      setFormSubmitted(true);
    }

    try {
      const dataString = JSON.stringify(data);
      const res = await formImport(fileContent, dataString);
      const { data: responseData } = res;
      const formId = responseData.mapper?.formId;

      setImportLoader(false);
      setFormSubmitted(false);

      if (actionType === UploadActionType.VALIDATE) {
        const formExtracted = await FileService.extractFileDetails(fileContent);

        if (Array.isArray(formExtracted?.forms)) {
          setFormTitle(formExtracted?.forms[0]?.formTitle || "");
          setDescription(
            formExtracted?.forms[0]?.formDescription || ""
          );
        }
      } else if (formId) {
        navigateToDesignFormEdit(dispatch, tenantKey, formId);
      }
    } catch (err) {
      setImportLoader(false);
      setFormSubmitted(false);
      setImportError(err?.response?.data?.message);
    }
  };

  // Fetching is now handled by FormListGrid based on mode

  const validateForm = ({ title }) => {
    if (!title || title.trim() === "") {
      return "This field is required";
    }
    return null;
  };

  const validateFormNameOnBlur = ({ title, ...rest }) => {
    //the reset variable contain title, description, display  also sign for clicked in create button
    const error = validateForm({ title });

    if (error) {
      setNameError(error);
      return;
    }
    validateFormTitle({ title, ...rest });
  };

  const handleBuild = ({ description, display, title }) => {
    setFormSubmitted(true);
    const error = validateForm({ title });
    if (error) {
      setNameError(error);
      return;
    }
    const name = _camelCase(title);
    const newForm = {
      display,
      tags: ["common"],
      submissionAccess: submissionAccess,
      componentChanged: true,
      newVersion: true,
      components: [],
      access: formAccess,
      title,
      name,
      description,
      path: name.toLowerCase(),
    };
    newForm.components = addHiddenApplicationComponent(newForm).components;

    if (MULTITENANCY_ENABLED && tenantKey) {
      newForm.tenantKey = tenantKey;
      newForm.path = addTenantkey(newForm.path, tenantKey);
      newForm.name = addTenantkey(newForm.name, tenantKey);
    }
    formCreate(newForm)
      .then((res) => {
        const form = res.data;
        dispatch(setFormSuccessData("form", form));
        startSuccessCountdown(() => {
          navigateToDesignFormEdit(dispatch, tenantKey, form._id);
        },2);
      })
      .catch((err) => {
        let error;
        if (err.response?.data) {
          error = err.response.data;
          console.log(error);
          setNameError(error?.errors?.name?.message);
        } else {
          error = err.message;
          setNameError(error?.errors?.name?.message);
        }
      })
      .finally(() => {
        setFormSubmitted(false);
      });
  };

  const renderTable = () => {
    if (createDesigns || viewDesigns) {
      return (
        <FormListGrid
          mode="designer"
          onDesignerEdit={(row) => navigateToDesignFormEdit(dispatch, tenantKey, row._id)}
        />
      );
    }
    if (createSubmissions) {
      return (
        <FormListGrid
          mode="submit"
          onSubmitSelect={(row) => navigateToFormEntries(dispatch, tenantKey, row.parentFormId)}
        />
      );
    }
    return null;
  };


  return (
    <>
      {(forms?.isActive || designerFormLoading || isBPMFormListLoading) &&
      !searchFormLoading ? (
        <div data-testid="Form-list-component-loader">
          <Loading />
        </div>
      ) : (
        <>
                <div className="toast-section">
                        <Alert
                          message={t("Duplicating the form")}
                          variant={AlertVariant.FOCUS}
                          isShowing={isDuplicating}
                          rightContent={<CustomProgressBar progress={duplicateProgress} />}
                        />
                </div>  
                
                <div className="header-section-1">
                    <div className="section-seperation-left">
                        <h4> Build</h4>  
                    </div>
                    <div className="section-seperation-right">
                        <V8CustomButton
                            label={t("Create New Form")}
                            onClick={() => navigateToDesignFormBuild(dispatch, tenantKey)}
                            dataTestId="create-form-button"
                            ariaLabel="Create Form"
                            variant="primary"
                        />
                    </div>
                </div>

                <div className="header-section-2">
                  <div className="section-seperation-left">
                                <CustomSearch
                                  search={search}
                                  setSearch={setSearch}
                                  handleSearch={handleSearch}

                                  placeholder={t("Search Form Name and Description")}
                                  searchLoading={searchFormLoading}
                                  title={t("Search Form Name and Description")}
                                  dataTestId="form-search-input"
                                  width="22rem"
                                />
                    </div>
                 </div>

                 <div className="body-section">
                    {renderTable()}
                 </div>


        
          {(
              <div className="table-bar">
                <div className="filters">
                </div>
                {/* hiding for the time being. */}
                <div className="actions" style={{display:"none"}}>
                  <FilterSortActions
                    showSortModal={showSortModal}
                    handleFilterIconClick={handleFilterIconClick}
                    handleSortModalClose={handleSortModalClose}
                    handleSortApply={handleSortApply}
                    optionSortBy={optionSortBy}
                    defaultSortOption={formSort.activeKey}
                    defaultSortOrder={formSort[formSort.activeKey]?.sortOrder || "asc"}
                    filterDataTestId="form-list-filter"
                    filterAriaLabel="Filter the form list"
                  /> 

                  {createDesigns && (
                    <CustomButton
                      label={t("New Form & Flow")}
                      onClick={() => setNewFormModal(true)}
                      dataTestId="create-form-button"
                      ariaLabel="Create Form"
                      action
                    />
                  )}
                  <CreateFormModal
                    newFormModal={newFormModal}
                    actionType={ActionType}
                    onClose={onClose}
                    onAction={handleAction}
                  />
                  <FormBuilderModal
                    modalHeader={t("Build New Form")}
                    nameLabel={t("Form Name")}
                    descriptionLabel={t("Form Description")}
                    showBuildForm={showBuildForm}
                    isSaveBtnLoading={formSubmitted}
                    isFormNameValidating={validationLoading}
                    onClose={onCloseBuildModal}
                    onAction={handleAction}
                    primaryBtnAction={handleBuild}
                    setNameError={setNameError}
                    nameValidationOnBlur={validateFormNameOnBlur}
                    nameError={nameError}
                    buildForm={true}
                    showSuccess={successState?.showSuccess} // ✅ Pass success state
                    successCountdown={successState?.countdown} // ✅ Pass countdown
                  />
                  {importFormModal && (
                    <ImportModal
                      importLoader={importLoader}
                      importError={importError}
                      showModal={importFormModal}
                      uploadActionType={UploadActionType}
                      formName={formTitle}
                      formSubmitted={formSubmitted}
                      description={description}
                      onClose={onCloseimportModal}
                      handleImport={handleImport}
                      headerText={t("Import New Form")}
                      primaryButtonText={t("Confirm and Edit Form")}
                      fileType=".json"
                    />
                  )}
                </div>
              </div>
          )}
         {/* {renderTable()} */}
        </>
      )}
    </>
  );
});
List.propTypes = {
  forms: PropTypes.object,
};
const mapStateToProps = (state) => {
  return {
    forms: selectRoot("forms", state),
    userRoles: selectRoot("user", state).roles || [],
    modalOpen: selectRoot("formDelete", state).formDelete.modalOpen,
    formId: selectRoot("formDelete", state).formDelete.formId,
    formName: selectRoot("formDelete", state).formDelete.formName,
    isFormWorkflowSaved: selectRoot("formDelete", state).isFormWorkflowSaved,
    tenants: selectRoot("tenants", state),
    path: selectRoot("formDelete", state)?.formDelete.path,
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
                  {(t) =>
                    t(
                      `${_.capitalize(
                        formProcessData?.formType
                      )} deletion unsuccessful`
                    )
                  }
                </Translation>
              );
            } else {
              toast.success(
                <Translation>
                  {(t) =>
                    t(
                      `${_.capitalize(
                        formProcessData?.formType
                      )} deleted successfully`
                    )
                  }
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
