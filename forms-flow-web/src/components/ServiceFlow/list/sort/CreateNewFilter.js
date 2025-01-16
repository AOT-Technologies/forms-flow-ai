import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import Select from "react-select";
import {
  fetchAllBpmProcesses,
  fetchTaskVariables,
} from "../../../../apiManager/services/processServices";
import { listProcess } from "../../../../apiManager/services/formatterService";
import userRoles from "../../../../constants/permissions";

import {
  deleteFilters,
  editFilters,
  fetchBPMTaskCount,
  fetchFilterList,
  fetchServiceTaskList,
  saveFilters,
} from "../../../../apiManager/services/bpmTaskServices";
import {
  ACCESSIBLE_FOR_ALL_GROUPS,
  PRIVATE_ONLY_YOU,
  SPECIFIC_USER_OR_GROUP,
} from "../../../../constants/taskConstants";
import { useTranslation } from "react-i18next";
import { Translation } from "react-i18next";
import {
  setBPMFilterLoader,
  setBPMFiltersAndCount,
  setFilterListParams,
  setSelectedBPMFilter,
} from "../../../../actions/bpmTaskActions";

import TaskAttributeComponent from "./TaskAttributeComponent";
import { toast } from "react-toastify";
import { getUserRoles } from "../../../../apiManager/services/authorizationService";
import { setUserGroups } from "../../../../actions/authorizationActions";
import {
  Badge,
  ListGroup,
  OverlayTrigger,
  Popover,
  Modal,
  Button,
} from "react-bootstrap";
import { trimFirstSlash } from "../../constants/taskConstants";
import { cloneDeep, omitBy } from "lodash";
import {
  MULTITENANCY_ENABLED,
} from "../../../../constants/constants";
import { fetchAllForms } from "../../../../apiManager/services/bpmFormServices";
import { fetchUserList } from "../../../../apiManager/services/bpmTaskServices";
import { filterSelectOptionByLabel } from "../../../../helper/helper";
import { removeTenantKey } from "../../../../helper/helper";

const initialValueOfTaskAttribute = {
  applicationId: true,
  assignee: true,
  createdDate: true,
  dueDate: true,
  followUp: true,
  priority: true,
};

export default function CreateNewFilterDrawer({
  selectedFilterData,
  openFilterDrawer,
  setOpenFilterDrawer,
  setFilterSelectedForEdit,
  viewMode,
  resetViewMode,
}) {
  const dispatch = useDispatch();
  const [filterName, setFilterName] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [showUndefinedVariable, setShowUndefinedVariable] = useState(false);
  const [definitionKeyId, setDefinitionKeyId] = useState("");
  const [candidateGroup, setCandidateGroup] = useState([]);
  const [assignee, setAssignee] = useState("");
  const [filterDisplayOrder, setFIlterDisplayOrder] = useState(null);

  const [
    isTasksForCurrentUserGroupsEnabled,
    setIsTasksForCurrentUserGroupsEnabled,
  ] = useState(true);
  const [isMyTasksEnabled, setIsMyTasksEnabled] = useState(false);
  const [permissions, setPermissions] = useState(PRIVATE_ONLY_YOU);
  const [identifierId, setIdentifierId] = useState("");
  const [selectUserGroupIcon, setSelectUserGroupIcon] = useState("");
  const [specificUserGroup, setSpecificUserGroup] = useState("");
  const [taskVariableFromMapperTable, setTaskVariableFromMapperTable] =
    useState([]);
  const firstResult = useSelector((state) => state.bpmTasks.firstResult);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const process = useSelector((state) => state.process?.processList);
  const processList = useMemo(() => listProcess(process, true), [process]);
  const { createFilters, admin } = userRoles();
  const userGroups = useSelector(
    (state) => state.userAuthorization?.userGroups
  );
  const userDetails = useSelector(
    (state) => state.user?.userDetail
  );
  const sortParams = useSelector(
    (state) => state.bpmTasks.filterListSortParams
  );
  const searchParams = useSelector(
    (state) => state.bpmTasks.filterListSearchParams
  );
  const selectedFilter = useSelector((state) => state.bpmTasks.selectedFilter);

  const [variables, setVariables] = useState([]);
  const [forms, setForms] = useState({ data: [], isLoading: true });
  const [selectedForm, setSelectedForm] = useState(null);
  const [taskVariablesKeys, setTaskVariablesKeys] = useState({});
  const [processLoading, setProcessLoading] = useState(false);
  //const loginedUserRoles = useSelector((state) => state.user.roles || []);

  const [overlayGroupShow, setOverlayGroupShow] = useState(false);
  const [overlayUserShow, setOverlayUserShow] = useState(false);

  const { t } = useTranslation();
  const [modalShow, setModalShow] = useState(false);
  const [checkboxes, setCheckboxes] = useState(initialValueOfTaskAttribute);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const fetchTasks = (resData) => {
    const reqParamData = {
      ...{ sorting: [...sortParams.sorting] },
      ...searchParams,
    };

    const selectedBPMFilterParams = {
      ...resData,
      criteria: {
        ...resData?.criteria,
        ...reqParamData,
      },
    };
    dispatch(setFilterListParams(cloneDeep(selectedBPMFilterParams)));
  };

  // const customTrim = (inputString) => {
  //   // Remove '%' symbol from the start
  //   const startIndex = inputString?.indexOf("%");
  //   if (startIndex === 0) {
  //     inputString = inputString?.substring(1);
  //   }

  //   // Remove '%' symbol from the end
  //   const endIndex = inputString?.lastIndexOf("%");
  //   if (endIndex === inputString?.length - 1) {
  //     inputString = inputString?.substring(0, endIndex);
  //   }
  //   return inputString;
  // };

  const handleFetchTaskVariables = (formId) => {
    setProcessLoading(true);
    fetchTaskVariables(formId)
      .then((res) => {
        setTaskVariableFromMapperTable(res.data?.taskVariables || []);
        setProcessLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setProcessLoading(false);
      });
  };

  const setTaskVariablesAndItsKeys = (variables = []) => {
    setVariables(variables);
    // taking variable names to check it is already exist or not
    setTaskVariablesKeys(
      variables.reduce((i, variable) => {
        i[variable.name] = variable.name;
        return i;
      }, {})
    );
  };

  useEffect(() => {
    if (selectedFilterData) {
      setFilterName(selectedFilterData.name);
      setCreatedBy(selectedFilterData.createdBy);
      setFIlterDisplayOrder(selectedFilterData.order);
      let processDefinitionName =
        selectedFilterData?.criteria?.processDefinitionKey;
      setDefinitionKeyId(processDefinitionName);
      let candidateGroupName = selectedFilterData?.criteria?.candidateGroup;
      if (
        MULTITENANCY_ENABLED &&
        candidateGroupName &&
        candidateGroupName.includes(tenantKey)
      ) {
        candidateGroupName = candidateGroupName.slice(tenantKey.length + 1);
      }
      setCandidateGroup(candidateGroupName);
      setAssignee(selectedFilterData?.criteria?.assignee);
      setShowUndefinedVariable(
        selectedFilterData?.properties?.showUndefinedVariable
      );

      if (selectedFilterData?.properties?.formId) {
        setSelectedForm(selectedFilterData?.properties?.formId || null);
        handleFetchTaskVariables(selectedFilterData?.properties?.formId);
      }

      setTaskVariablesAndItsKeys(selectedFilterData.variables);

      if (
        !selectedFilterData?.users?.length &&
        !selectedFilterData?.roles?.length
      ) {
        setSpecificUserGroup("");
        setPermissions(ACCESSIBLE_FOR_ALL_GROUPS);
      }

      if (selectedFilterData?.users?.length) {
        setPermissions(PRIVATE_ONLY_YOU);
      }
      // if (selectedFilterData?.users?.length && !isUserInRoles) {
      //   setPermissions(SPECIFIC_USER_OR_GROUP);
      //   setSelectUserGroupIcon("user");
      //   setIdentifierId(selectedFilterData?.users[0]);
      //   setSpecificUserGroup(SPECIFIC_USER_OR_GROUP);
      // }
      if (selectedFilterData?.roles?.length) {
        setPermissions(SPECIFIC_USER_OR_GROUP);
        setSelectUserGroupIcon("group");
        setIdentifierId(selectedFilterData?.roles[0]);
        setSpecificUserGroup(SPECIFIC_USER_OR_GROUP);
      }
      if (selectedFilterData?.criteria?.assigneeExpression) {
        setIsMyTasksEnabled(true);
      }

      // if the user has this role then we will check the condition else it will always true
      if (admin) {
        setIsTasksForCurrentUserGroupsEnabled(
          selectedFilterData?.criteria?.candidateGroupsExpression ? true : false
        );
      }

      setCheckboxes({
        applicationId: selectedFilterData?.taskVisibleAttributes?.applicationId,
        assignee: selectedFilterData?.taskVisibleAttributes?.assignee,
        createdDate: selectedFilterData?.taskVisibleAttributes?.createdDate,
        dueDate: selectedFilterData?.taskVisibleAttributes?.dueDate,
        followUp: selectedFilterData?.taskVisibleAttributes?.followUp,
        priority: selectedFilterData?.taskVisibleAttributes?.priority,
      });
    }
  }, [selectedFilterData]);

  useEffect(() => {
    getUserRoles()
      .then((res) => {
        if (res) {
          dispatch(setUserGroups(res.data));
        }
      })
      .catch((error) => console.error("error", error));
  }, []);

  useEffect(() => {
    if (openFilterDrawer) {
      dispatch(fetchUserList()); // if the create new filter open then need to fetch list of users
      dispatch(fetchAllBpmProcesses({ tenant_key: tenantKey })); // if the create new filter open then need to fetch all bpm process
    }
    // if the create new filter open then need to fetch all forms
    if (openFilterDrawer && !forms?.data?.length) {
      fetchAllForms()
        .then((res) => {
          const data = res.data?.forms || [];
          setForms({
            data: data.map((i) => ({ label: i.formName, value: i.formId })),
            isLoading: false,
          });
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [openFilterDrawer]);

  const resetVariables = () => {
    setVariables([]);
    setTaskVariablesKeys({
      applicationId: "applicationId",
      formName: "formName",
    });
  };

  const onChangeSelectForm = (e) => {
    if (e?.value) {
      handleFetchTaskVariables(e?.value);
      if (e?.value === selectedFilterData?.properties?.formId) {
        setTaskVariablesAndItsKeys(selectedFilterData?.variables);
      } else {
        resetVariables();
      }
    } else {
      resetVariables();
      setTaskVariableFromMapperTable([]);
    }
    setSelectedForm(e?.value);
  };

  const successCallBack = (resData) => {
    dispatch(
      fetchFilterList((err, data) => {
        if (data) {
          fetchBPMTaskCount(data.filters)
            .then((res) => {
              dispatch(setBPMFiltersAndCount(res.data));
            })
            .catch((err) => {
              if (err) {
                console.error(err);
              }
            })
            .finally(() => {
              if (selectedFilterData) {
                if (selectedFilterData?.id === selectedFilter?.id) {
                  dispatch(setSelectedBPMFilter(resData));
                  fetchTasks(resData);
                }
                toast.success(t("Changes Applied Successfully"));
              } else {
                toast.success(t("Filter Created Successfully"));
              }
              dispatch(setBPMFilterLoader(false));
            });
        }
      })
    );
    toggleDrawer();
    clearAllFilters();
  };

  const clearAllFilters = () => {
    setShowAlert(false);
    setFilterName("");
    setShowUndefinedVariable("");
    setDefinitionKeyId("");
    setCandidateGroup("");
    setAssignee("");
    setPermissions(PRIVATE_ONLY_YOU);
    setIdentifierId("");
    setSelectUserGroupIcon("");
    setSpecificUserGroup("");
    setIsTasksForCurrentUserGroupsEnabled(true);
    setIsMyTasksEnabled(false);
    setSelectedForm(null);
    setTaskVariableFromMapperTable([]);
    setCheckboxes(initialValueOfTaskAttribute);
    setForms({ data: [], isLoading: true });
    setFIlterDisplayOrder(null);
  };

  const handleSubmit = () => {
    let users = [];
    let roles = [];
    if (permissions === ACCESSIBLE_FOR_ALL_GROUPS) {
      users = [];
      roles = [];
    }
    if (permissions === PRIVATE_ONLY_YOU) {
      users.push(userDetails.preferred_username);
    }
    if (
      selectUserGroupIcon === "user" &&
      permissions === SPECIFIC_USER_OR_GROUP
    ) {
      users.push(identifierId);
    }
    if (
      selectUserGroupIcon === "group" &&
      permissions === SPECIFIC_USER_OR_GROUP
    ) {
      roles.push(identifierId);
    }

    const applicationIdExists = variables.some(
      (variable) => variable.name === "applicationId"
    );
    const formNameExists = variables.some(
      (variable) => variable.name === "formName"
    );

    const data = {
      name: filterName,
      order: filterDisplayOrder,
      criteria: {
        processDefinitionKey: definitionKeyId,
        candidateGroup:
          MULTITENANCY_ENABLED && candidateGroup
            ? tenantKey + "-" + trimFirstSlash(candidateGroup)
            : candidateGroup,
        assignee: assignee,
        includeAssignedTasks:
          isTasksForCurrentUserGroupsEnabled || candidateGroup ? true : null,
      },
      properties: {
        showUndefinedVariable: showUndefinedVariable,
      },
      variables: [
        ...variables,
        ...(applicationIdExists
          ? []
          : [{ name: "applicationId", label: "Submission Id" }]),
        ...(formNameExists ? [] : [{ name: "formName", label: "Form Name" }]),
      ],
      users: users,
      roles: roles?.length ? roles : [],
      taskVisibleAttributes: { ...checkboxes },
      isTasksForCurrentUserGroupsEnabled: isTasksForCurrentUserGroupsEnabled,
      isMyTasksEnabled: isMyTasksEnabled,
    };
   
    /**
     * If a form is selected, set the formId property in the data object
     * to the id of the selected form.
     */

    // Remove empty keys inside criteria
    const cleanedCriteria = omitBy(
      data.criteria,
      (value) => value === undefined || value === "" || value === null
    );
    data.criteria = cleanedCriteria;

    if (selectedForm) {
      data.properties.formId = selectedForm;
      data.criteria.processVariables = [
        { name: "formId", operator: "eq", value: selectedForm },
      ];
    }

    const submitFunction = selectedFilterData
      ? editFilters(data, selectedFilterData?.id)
      : saveFilters(data);
    submitFunction
      .then((res) => {
        successCallBack(res.data);
      })
      .catch((error) => {
        toast.error(t("Filter Creation Failed"));
        console.error("error", error);
      });
  };

  const handleFilterDelete = () => {
    deleteFilters(selectedFilterData?.id)
      .then(() => {
        dispatch(
          fetchFilterList((err, data) => {
            if (data) {
              fetchBPMTaskCount(data.filters)
                .then((res) => {
                  dispatch(setBPMFiltersAndCount(res.data));
                  const filter = data.filters.find((i) => data.defaultFilter == i.id) ||
                    data.filters[0];
                  dispatch(fetchServiceTaskList(filter, null, firstResult));
                })
                .catch((err) => {
                  if (err) {
                    console.error(err);
                  }
                });
            }
            toast.success(t("Filter Deleted Successfully"));
          })
        );
      })

      .catch((error) => {
        toast.error(t("Filter Creation Failed"));
        console.error("error", error);
      });
  };

  const addGroups = (data) => {
    setIdentifierId(data);
    if (selectUserGroupIcon === "user") {
      setOverlayUserShow(!overlayUserShow);
    } else {
      setOverlayGroupShow(!overlayGroupShow);
    }
  };

  //Function to checking which icon is selected
  const handleClickUserGroupIcon = (icon) => {
    if (icon === "user") {
      setOverlayUserShow(!overlayUserShow);
      setOverlayGroupShow(false);
    } else {
      setOverlayGroupShow(!overlayGroupShow);
      setOverlayUserShow(false);
    }
    setSelectUserGroupIcon(icon);
  };

  //function for taking the value from the radio button Specific User/ Group
  const handleSpecificUserGroup = (e) => {
    setPermissions(e.target.value);
    if (e.target.value === SPECIFIC_USER_OR_GROUP) {
      setSpecificUserGroup(e.target.value);
    } else {
      setSpecificUserGroup("");
      setSelectUserGroupIcon("");
      setIdentifierId("");
    }
  };

  const toggleDrawer = () => {
    setOpenFilterDrawer(!openFilterDrawer);
    resetViewMode();
    !openFilterDrawer ? setFilterSelectedForEdit(false) : null;
  };

  const toggleModal = () => {
    setModalShow(!modalShow);
    setOpenFilterDrawer(!openFilterDrawer);
  };

  const deleteConfirmationModalToggleDrawer = () => {
    setOpenFilterDrawer(!openFilterDrawer);
  };

  const candidateGroups = useSelector(
    (state) => state.user?.userDetail?.groups || []
  );
  const userListResponse = useSelector((state) => state.bpmTasks.userList) || {
    data: [],
  };
  const userList = userListResponse?.data || [];
  const assigneeOptions = useMemo(() => {
    return userList.map((user) => ({
      value: `${user.username}`,
      label: `${user.username}`,
    }));
  }, [userList]);
  
  const candidateOptions = useMemo(() => {
    return MULTITENANCY_ENABLED
      ? candidateGroups.map((group) => ({
          value: removeTenantKey(group, tenantKey),
          label: removeTenantKey(group, tenantKey),
        }))
      : candidateGroups.map((group) => ({
          value: trimFirstSlash(group),
          label: group,
        }));
  }, [candidateGroups, MULTITENANCY_ENABLED]);
  
  const handleAssignee = (selectedOption) => {
    setAssignee(selectedOption ? selectedOption.value : null);
  };
  const handleCandidate = (selectedOption) => {
    setCandidateGroup(selectedOption ? selectedOption.value : null);
  };

  const onSaveTaskAttribute = (
    taskVariablesKeys,
    variables,
    checkboxes,
    showUndefinedVariable
  ) => {
    setVariables(variables);
    setTaskVariablesKeys(taskVariablesKeys);
    setCheckboxes(checkboxes);
    setShowUndefinedVariable(showUndefinedVariable);
  };

  const hideDeleteConfirmation = () => {
    setShowDeleteModal(false);
    deleteConfirmationModalToggleDrawer();
  };

  const showDeleteConfirmation = () => {
    setShowDeleteModal(true);
    toggleDrawer();
  };

  const FilterDelete = () => {
    setShowDeleteModal(false);
    handleFilterDelete();
  };

  const textTruncate = (wordLength, targetLength, text) => {
    return text?.length > wordLength
      ? text.substring(0, targetLength) + "..."
      : text;
  };

  const handleFilterName = (e) => {
    const value = e.target.value;
    setFilterName(value);
    if (value.length >= 50) {
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  };

  const handleOrderChange = (e) => {
    const value = e.target.value;
    const pattern = /^[1-9]\d*$/;
    const validInput = pattern.test(e.target.value);
    setFIlterDisplayOrder(() =>
      value ? Number(validInput ? value : filterDisplayOrder) : null
    );
  };

  const list = () => (
    <div role="none">
      <List>
        <div
          className={`p-0 d-flex align-items-center justify-content-${
            viewMode ? "end" : "between"
          }`}
        >
          {!viewMode ? (
            <h5 className="fw-bold fs-16">
              <Translation>
                {(t) =>
                  `${
                    selectedFilterData
                      ? t("Edit filter")
                      : t("Create new filter")
                  }`
                }
              </Translation>
            </h5>
          ) : null}
          <button
            className="btn btn-link text-dark"
            onClick={() => {
              toggleDrawer();
              setShowAlert(false);
            }}
          >
            <Translation>{(t) => t("Close")}</Translation>
          </button>
        </div>
      </List>
      <List>
        <div className="form-group">
          <label htmlFor="filterName">{t("Filter Name")}</label>
          <input
            type="text"
            className={`form-control ${showAlert ? "is-invalid" : ""}`}
            id="filterName"
            placeholder={t("Enter your text here")}
            value={filterName}
            onChange={handleFilterName}
            title={t("Add fliter name")}
            disabled={viewMode}
          />
          {showAlert && (
            <p className="text-danger mt-2 fs-6">
              {t("Filter name should be less than 50 characters")}
            </p>
          )}
        </div>
      </List>
      <List>
        <div className="form-group">
          <label htmlFor="filterDisplayOrder">
            {t("Filter display order")}
          </label>
          <input
            type="text"
            className="form-control"
            id="filterDisplayOrder"
            placeholder={t("Enter filter display order")}
            value={filterDisplayOrder}
            min={1}
            onChange={handleOrderChange}
            title={t("Enter fliter display order")}
            disabled={viewMode}
          />
        </div>
      </List>

      <List>
        <p className="fw-bold mb-0">
          <Translation>{(t) => t("Criteria")}</Translation>{" "}
          <i
            title={t(
              "This section is aimed to set the parameters\nused to filter the tasks"
            )}
            className="fa fa-info-circle filter-tooltip-icon"
          ></i>
        </p>
        <div className="d-flex align-items-center mt-1">
          <input
            className="me-1"
            type="checkbox"
            checked={isMyTasksEnabled}
            onChange={(e) => setIsMyTasksEnabled(e.target.checked)}
            title={t("Show only current user assigned task")}
            disabled={viewMode}
          />
          <p className="mb-0">
            <Translation>
              {(t) => t("Show only current user assigned task")}
            </Translation>
          </p>
        </div>

        {admin && (
          <>
            <div className="d-flex align-items-center mt-1">
              <input
                className="me-1"
                type="checkbox"
                checked={isTasksForCurrentUserGroupsEnabled}
                onChange={(e) =>
                  setIsTasksForCurrentUserGroupsEnabled(e.target.checked)
                }
                title={t("Display authorized tasks based on user roles")}
                disabled={viewMode}
              />
              <p className="mb-0">
                <Translation>
                  {(t) => t("Display authorized tasks based on user roles")}
                </Translation>
              </p>
            </div>
            {!isTasksForCurrentUserGroupsEnabled ? (
              <div className="alert taskvariable-alert mt-1" role="alert">
                <i className="fa-solid fa-triangle-exclamation me-2"></i>{" "}
                {t(
                  "Unchecking this option will show all tasks, ignoring user roles"
                )}
              </div>
            ) : null}
          </>
        )}

        <div className="my-2">
          <label htmlFor="select-workflow">
            <p className="mt-2 fw-bold  mb-0">
              <Translation>{(t) => t("Flow")}</Translation>
            </p>
          </label>
          <Select
            isDisabled={viewMode}
            className="mb-3"
            options={processList}
            placeholder={t("Select Flow")}
            isClearable
            value={processList?.find((list) => list.value === definitionKeyId)}
            onChange={(selectedOption) => {
              setDefinitionKeyId(selectedOption?.value);
            }}
            filterOption={filterSelectOptionByLabel}
            inputId="select-workflow"
            getOptionLabel={(option) => (
              <span data-testid={`form-workflow-option-${option.value}`}>
                {option.label}
              </span>
            )}
          />
        </div>

        <div className="my-2">
          <label htmlFor="select-user-group">
            <p className="fw-bold  mb-0">
              {MULTITENANCY_ENABLED ? (
                <Translation>{(t) => t("User Role")}</Translation>
              ) : (
                <Translation>{(t) => t("User Group")}</Translation>
              )}
            </p>
          </label>

          <Select
            isDisabled={viewMode}
            inputId="select-user-group"
            onChange={handleCandidate}
            value={
              candidateGroup
                ? { value: candidateGroup, label: candidateGroup }
                : null
            }
            isClearable={true}
            placeholder={
              MULTITENANCY_ENABLED
                ? t("Select User Role")
                : t("Select User Group")
            }
            options={candidateOptions}
          />
        </div>

        <div className="my-2">
          <label htmlFor="select-assignee">
            <p className="pt-2 fw-bold  mb-0">
              <Translation>{(t) => t("Assignee")}</Translation>
            </p>
          </label>

          <Select
            isDisabled={viewMode}
            inputId="select-assignee"
            onChange={handleAssignee}
            value={assignee ? { value: assignee, label: assignee } : null}
            isClearable={true}
            placeholder={t("Select Assignee")}
            options={assigneeOptions}
          />
        </div>

        <div className="my-3">
          <Divider />
          <div className="my-3">
            <label htmlFor="select-form">
              <p className="fw-bold  mb-0">
                <Translation>{(t) => t("Select Form")}</Translation>
              </p>
            </label>
            <Select
              isDisabled={viewMode}
              inputId="select-form"
              onChange={onChangeSelectForm}
              value={forms?.data.find((form) => form.value === selectedForm)}
              isClearable
              placeholder={t("Select Form")}
              options={forms?.data}
              isLoading={forms.isLoading}
            />
          </div>
          <p className="fw-bold  mb-0 ">
            <Translation>{(t) => t("Task Attributes")}</Translation>
            <i
              title={t(
                "This section is aimed to set select\ntask attributes that will be visible in\nthe task list view"
              )}
              className="fa fa-info-circle ms-2 filter-tooltip-icon"
            ></i>
          </p>

          <button
            className="btn btn-outline-primary w-100"
            onClick={toggleModal}
          >
            {t("Click here to select attributes")}
          </button>
        </div>
        <Divider />
        <div className="child-container-two pt-2">
          <p className="fw-bold mb-0">
            <Translation>{(t) => t("Permission")}</Translation>{" "}
            <i
              title={t(
                "This section is aimed to set read\npermissions for the filter"
              )}
              className="fa fa-info-circle filter-tooltip-icon"
            ></i>
          </p>
          <input
            className="access-all"
            type="radio"
            id="all-users"
            name="my-radio"
            value={ACCESSIBLE_FOR_ALL_GROUPS}
            checked={permissions === ACCESSIBLE_FOR_ALL_GROUPS}
            onChange={(e) => setPermissions(e.target.value)}
            disabled={viewMode}
          />
          <label htmlFor="all-users" className="assigned-user">
            <Translation>{(t) => t("Accessible for all users")}</Translation>
          </label>{" "}
          <br />
          <input
            className="access-all"
            type="radio"
            id="private-only"
            name="my-radio"
            value={PRIVATE_ONLY_YOU}
            checked={permissions === PRIVATE_ONLY_YOU}
            onChange={(e) => setPermissions(e.target.value)}
            disabled={viewMode}
          />
          <label htmlFor="private-only">
            <Translation>{(t) => t("Private (Only You)")}</Translation>
          </label>
          <br />
          <input
            className="access-all"
            type="radio"
            id="specific-grp"
            name="my-radio"
            value={SPECIFIC_USER_OR_GROUP}
            checked={permissions === SPECIFIC_USER_OR_GROUP}
            onChange={handleSpecificUserGroup}
            disabled={viewMode}
          />
          <label htmlFor="specific-grp" >
            <Translation>{(t) => t("Specific Group")}</Translation>
          </label>{" "}
          <br />
          {permissions === SPECIFIC_USER_OR_GROUP &&
            specificUserGroup === SPECIFIC_USER_OR_GROUP ? (
            <div className="d-flex">
              <OverlayTrigger
                placement="right"
                trigger="click"
                rootClose={true}
                show={overlayGroupShow}
                overlay={
                  <Popover className="z-index">
                    <div className="poper">
                      <ListGroup  className="preview-list-group" >
                        {userGroups.length > 0 &&
                          userGroups?.map((e, i) => (
                            <ListGroup.Item
                              key={i}
                              as="button"
                              onClick={() => addGroups(e.name)}
                            >
                              {e.name}
                            </ListGroup.Item>
                          ))}
                      </ListGroup>
                    </div>
                  </Popover>
                }
              >
                <div
                  className="ms-3"
                  onClick={
                    !viewMode ? () => handleClickUserGroupIcon("group") : null
                  }
                >
                  <div className="text-center">
                    <span className="truncate-size">
                      <Translation>{(t) => t("Group")}</Translation>
                    </span>
                  </div>
                  <div className="text-center text-bottom">
                    <i
                      className={`fa fa-users ${
                        selectUserGroupIcon === "group" ? "highlight" : ""
                        } cursor-pointer group-icon`}
                    />
                  </div>
                </div>
              </OverlayTrigger>
              <div className="mt-3">
                {identifierId && (
                  <Badge
                    pill
                    variant="outlined"
                    className="d-flex align-items-center badge me-2 mt-2"
                  >
                    {identifierId}
                    {!viewMode && (
                      <div
                        className="badge-deleteIcon ms-2 cursor-pointer"
                        onClick={() => setIdentifierId(null)}
                      >
                        &times;
                      </div>
                    )}
                  </Badge>
                )}
              </div>
            </div>
          ) : null}
        </div>
        {createdBy && <>
          <h5 className="fw-bold ">
            <Translation>{(t) => t("Filter Created by")}</Translation>
          </h5>
          <i className="fa-solid fa-user me-2"></i>
          {createdBy}
        </>}
        <Divider />
      </List>

      <List>
        <div className="d-flex align-items-center justify-content-between">
          {selectedFilterData && !viewMode && (
            <button
              className="btn btn-link text-danger cursor-pointer"
              onClick={() => {
                showDeleteConfirmation();
              }}
            >
              <Translation>{(t) => t("Delete Filter")}</Translation>
            </button>
          )}
          <div className="d-flex align-items-center">
            {!viewMode && (
              <button
                className="btn btn-secondary me-3"
                onClick={() => {
                  toggleDrawer();
                  setShowAlert(false);
                }}
              >
                <Translation>{(t) => t("Cancel")}</Translation>
              </button>
            )}

            {!viewMode && (
              <button
                className="btn btn-primary submitButton text-decoration-none truncate-size "
                disabled={
                  viewMode ||
                  !permissions ||
                  !filterName ||
                  filterName.length >= 50
                }
                onClick={() => {
                  handleSubmit();
                }}
              >
                <Translation>
                  {(t) =>
                    `${
                      selectedFilterData ? t("Save Filter") : t("Create Filter")
                    } `
                  }
                </Translation>
              </button>
            )}
          </div>
        </div>
      </List>
    </div>
  );
  return (
    <div>
      <React.Fragment key="left">
        {createFilters  && (
      <button
        onClick={() => {
          toggleDrawer();
          clearAllFilters();
        }}
        className="btn btn-outline-primary"
      >
        <Translation>{(t) => t("Create New Filter")}</Translation>
      </button>
    )}
        {modalShow && (
          <div>
            <TaskAttributeComponent
              show={modalShow}
              processLoading={processLoading}
              selectedForm={selectedForm}
              onHide={toggleModal}
              selectedTaskAttrbutes={checkboxes}
              selectedTaskVariablesKeys={taskVariablesKeys}
              selectedTaskVariables={variables}
              taskVariableFromMapperTable={taskVariableFromMapperTable}
              onSaveTaskAttribute={onSaveTaskAttribute}
              showUndefinedVariable={showUndefinedVariable}
              viewMode={viewMode}
            />
          </div>
        )}
        <Drawer
          anchor="left"
          open={openFilterDrawer}
          onClose={() => {
            toggleDrawer();
            setShowAlert(false);
          }}
          PaperProps={{
            style: {
              width: "400px",
              padding: "2%",
              overflowY: "auto",
              overflowX: "hidden",
              backdropFilter: " none !important",
              zIndex: 1400,
            },
          }}
          sx={{
            width: 100,
          }}
        >
          {list()}
        </Drawer>
      </React.Fragment>

      {/* Delete confirmation modal */}
      <Modal show={showDeleteModal} onHide={hideDeleteConfirmation}>
        <Modal.Header>
          <Modal.Title>
            <Translation>{(t) => t("Delete Confirmation")}</Translation>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Translation>{(t) => t("Are you sure to delete")}</Translation>{" "}
          <span className="fw-bold">
            {filterName.includes(" ")
              ? filterName
              : textTruncate(40, 30, filterName)}
          </span>{" "}
          <Translation>{(t) => t("filter?")}</Translation>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant=""
            className="btn-link text-dark"
            onClick={hideDeleteConfirmation}
          >
            <Translation>{(t) => t("Cancel")}</Translation>
          </Button>
          <Button variant="danger" onClick={FilterDelete}>
            <Translation>{(t) => t("Delete")}</Translation>
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
