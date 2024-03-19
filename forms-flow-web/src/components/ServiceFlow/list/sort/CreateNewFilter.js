import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import Select from "react-select";
import { fetchAllBpmProcesses } from "../../../../apiManager/services/processServices";
import { listProcess } from "../../../../apiManager/services/formatterService";

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
import { Badge, ListGroup, OverlayTrigger, Popover } from "react-bootstrap";
import { trimFirstSlash } from "../../constants/taskConstants";
import { cloneDeep, omitBy } from "lodash";
import {
  FORMSFLOW_ADMIN,
  MULTITENANCY_ENABLED,
} from "../../../../constants/constants";
import { fetchAllForms } from "../../../../apiManager/services/bpmFormServices";
import {
  getFormProcesses,
  resetFormProcessData,
} from "../../../../apiManager/services/processServices";
import { fetchUserList } from "../../../../apiManager/services/bpmTaskServices";

const initialValueOfTaskAttribute = {
  applicationId: true,
  assignee: true,
  taskTitle: true,
  createdDate: true,
  dueDate: true,
  followUp: true,
  priority: true,
  groups: true,
};

export default function CreateNewFilterDrawer({
  selectedFilterData,
  openFilterDrawer,
  setOpenFilterDrawer,
  setFilterSelectedForEdit,
}) {
  const dispatch = useDispatch();
  const [filterName, setFilterName] = useState("");
  const [showUndefinedVariable, setShowUndefinedVariable] = useState(false);
  const [definitionKeyId, setDefinitionKeyId] = useState("");
  const [candidateGroup, setCandidateGroup] = useState([]);
  const userRoles = useSelector((state) => state.user.roles || []);
  const [assignee, setAssignee] = useState("");

  const [
    isTasksForCurrentUserGroupsEnabled,
    setIsTasksForCurrentUserGroupsEnabled,
  ] = useState(true);
  const [isMyTasksEnabled, setIsMyTasksEnabled] = useState(false);
  const [permissions, setPermissions] = useState(PRIVATE_ONLY_YOU);
  const [identifierId, setIdentifierId] = useState("");
  const [selectUserGroupIcon, setSelectUserGroupIcon] = useState("");
  const [specificUserGroup, setSpecificUserGroup] = useState("");
  const firstResult = useSelector((state) => state.bpmTasks.firstResult);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const process = useSelector((state) => state.process?.processList);
  const processList = useMemo(() => listProcess(process, true), [process]);
  const userGroups = useSelector(
    (state) => state.userAuthorization?.userGroups
  );
  const userName = useSelector(
    (state) => state.user?.userDetail?.preferred_username
  );
  const sortParams = useSelector(
    (state) => state.bpmTasks.filterListSortParams
  );
  const searchParams = useSelector(
    (state) => state.bpmTasks.filterListSearchParams
  );
  const selectedFilter = useSelector((state) => state.bpmTasks.selectedFilter);
  const filterList = useSelector((state) => state.bpmTasks.filterList);

  const [variables, setVariables] = useState([]);
  const [forms, setForms] = useState({ data: [], isLoading: true });
  const [selectedForm, setSelectedForm] = useState(null);
  const [taskVariablesKeys, setTaskVariablesKeys] = useState({});
  const [processLoading, setProcessLoading] = useState(false);

  const [overlayGroupShow, setOverlayGroupShow] = useState(false);
  const [overlayUserShow, setOverlayUserShow] = useState(false);

  const { t } = useTranslation();
  const [modalShow, setModalShow] = useState(false);
  const [checkboxes, setCheckboxes] = useState(initialValueOfTaskAttribute);

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

  const customTrim = (inputString) => {
    // Remove '%' symbol from the start
    const startIndex = inputString?.indexOf("%");
    if (startIndex === 0) {
      inputString = inputString?.substring(1);
    }

    // Remove '%' symbol from the end
    const endIndex = inputString?.lastIndexOf("%");
    if (endIndex === inputString?.length - 1) {
      inputString = inputString?.substring(0, endIndex);
    }
    return inputString;
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
      setFilterName(selectedFilterData?.name);
      let processDefinitionName =
        selectedFilterData?.criteria?.processDefinitionNameLike;
      setDefinitionKeyId(customTrim(processDefinitionName));
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
        setProcessLoading(true);
        dispatch(
          getFormProcesses(selectedFilterData?.properties?.formId, () => {
            setProcessLoading(false);
          })
        );
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
      if (userRoles.includes(FORMSFLOW_ADMIN)) {
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
      dispatch(fetchAllBpmProcesses()); // if the create new filter open then need to fetch all bpm process
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
      setProcessLoading(true);
      dispatch(
        getFormProcesses(e.value, () => {
          setProcessLoading(false);
        })
      );
      if (e?.value === selectedFilterData?.properties?.formId) {
        setTaskVariablesAndItsKeys(selectedFilterData?.variables);
      } else {
        resetVariables();
      }
    } else {
      resetVariables();
      dispatch(resetFormProcessData());
    }
    setSelectedForm(e?.value);
  };

  const successCallBack = (resData) => {
    dispatch(
      fetchFilterList((err, data) => {
        if (data) {
          fetchBPMTaskCount(data)
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
                const filterSelected = filterList?.find(
                  (filter) => filter.id === selectedFilterData?.id
                );
                if (selectedFilterData?.id === selectedFilter?.id) {
                  dispatch(setSelectedBPMFilter(resData));
                  fetchTasks(resData);
                } else {
                  dispatch(setSelectedBPMFilter(filterSelected));
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
    dispatch(resetFormProcessData());
    setCheckboxes(initialValueOfTaskAttribute);
    setForms({ data: [], isLoading: true });
  };

  const handleSubmit = () => {
    let users = [];
    let roles = [];
    if (permissions === ACCESSIBLE_FOR_ALL_GROUPS) {
      users = [];
      roles = [];
    }
    if (permissions === PRIVATE_ONLY_YOU) {
      users.push(userName);
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
      criteria: {
        processDefinitionNameLike: definitionKeyId && `%${definitionKeyId}%`,
        candidateGroup:
          MULTITENANCY_ENABLED && candidateGroup
            ? tenantKey + "-" + candidateGroup
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
          : [{ name: "applicationId", label: "Submission ID" }]),
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
    if (selectedForm) {
      data.properties.formId = selectedForm;
    }

    // Remove empty keys inside criteria
    const cleanedCriteria = omitBy(
      data.criteria,
      (value) => value === undefined || value === "" || value === null
    );
    data.criteria = cleanedCriteria;

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
              fetchBPMTaskCount(data)
                .then((res) => {
                  dispatch(setBPMFiltersAndCount(res.data));
                  dispatch(fetchServiceTaskList(data[0], null, firstResult));
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
    !openFilterDrawer ? setFilterSelectedForEdit(false) : null;
  };

  const toggleModal = () => {
    setModalShow(!modalShow);
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
      value: `${user.firstName} ${user.lastName}`,
      label: `${user.firstName} ${user.lastName}`,
    }));
  }, [userList]);

  const candidateOptions = useMemo(() => {
    return candidateGroups.map((group) => ({
      value: group,
      label: trimFirstSlash(group),
    }));
  }, [candidateGroups]);

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

  const list = () => (
    <div role="presentation">
      <List>
        <div className="p-0 d-flex align-items-center justify-content-between ">
          <h5 className="fw-bold fs-16">
            <Translation>{(t) => t("Create new filter")}</Translation>
          </h5>
          <button className="btn btn-link text-dark" onClick={toggleDrawer}>
            <Translation>{(t) => t("Close")}</Translation>
          </button>
        </div>
      </List>
      <List>
        <div className="form-group">
          <label htmlFor="filterName">{t("Filter Name")}</label>
          <input
            type="text"
            className="form-control"
            id="filterName"
            placeholder={t("Enter your text here")}
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            title={t("Add fliter name")}
          />
        </div>
      </List>

      <List>
        <h5 className="fw-bold fs-18">
          <Translation>{(t) => t("Criteria")}</Translation>{" "}
          <i
            title={t(
              "This section is aimed to set the parameters\nused to filter the tasks"
            )}
            className="fa fa-info-circle filter-tooltip-icon"
          ></i>
        </h5>
        <div className="d-flex align-items-center mt-1">
          <input
            className="mr-6"
            type="checkbox"
            checked={isMyTasksEnabled}
            onChange={(e) => setIsMyTasksEnabled(e.target.checked)}
            title={t("Show only current user assigned task")}
          />
          <h5 className="assigned-user">
            <Translation>
              {(t) => t("Show only current user assigned task")}
            </Translation>
          </h5>
        </div>

        {userRoles.includes(FORMSFLOW_ADMIN) && (
          <>
            <div className="d-flex align-items-center mt-1">
              <input
                className="mr-6"
                type="checkbox"
                checked={isTasksForCurrentUserGroupsEnabled}
                onChange={(e) =>
                  setIsTasksForCurrentUserGroupsEnabled(e.target.checked)
                }
                title={t("Display authorized tasks based on user roles")}
              />
              <h5 className="assigned-user">
                <Translation>
                  {(t) => t("Display authorized tasks based on user roles")}
                </Translation>
              </h5>
            </div>
            {!isTasksForCurrentUserGroupsEnabled ? (
              <div className="alert alert-warning mt-1" role="alert">
                <i className="fa-solid fa-triangle-exclamation me-2"></i>{" "}
                {t(
                  "Unchecking this option will show all tasks, ignoring user roles"
                )}
              </div>
            ) : null}
          </>
        )}

        <div className="my-2">
          <h5 className="mt-2 fs-18 fw-bold">
            <Translation>{(t) => t("Workflow")}</Translation>
          </h5>
          <Select
            className="mb-3"
            options={processList}
            placeholder={t("Select Workflow")}
            isClearable
            value={processList?.find((list) => list.label === definitionKeyId)}
            onChange={(selectedOption) => {
              setDefinitionKeyId(selectedOption?.label);
            }}
            inputId="select-workflow"
            getOptionLabel={(option) => (
              <span data-testid={`form-workflow-option-${option.value}`}>
                {option.label}
              </span>
            )}
          />
        </div>

        <div className="my-2">
          <h5 className="fw-bold">
            <Translation>{(t) => t("Candidate Group")}</Translation>
          </h5>

          <Select
            onChange={handleCandidate}
            value={
              candidateGroup
                ? { value: candidateGroup, label: candidateGroup }
                : null
            }
            isClearable={true}
            placeholder={t("Select Candidate Group")}
            options={candidateOptions}
          />
        </div>

        <div className="my-2">
          <h5 className="pt-2 fw-bold">
            <Translation>{(t) => t("Assignee")}</Translation>
          </h5>

          <Select
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
            <h5 className="fw-bold ">
              <Translation>{(t) => t("Select Form")}</Translation>
            </h5>
            <Select
              onChange={onChangeSelectForm}
              value={forms?.data.find((form) => form.value === selectedForm)}
              isClearable
              placeholder={t("Select Form")}
              options={forms?.data}
              isLoading={forms.isLoading}
            />
          </div>
          <h5 className="fw-bold ">
            <Translation>{(t) => t("Task Attributes")}</Translation>
            <i
              title={t(
                "This section is aimed to set select\ntask attributes that will be visible in\nthe task list view"
              )}
              className="fa fa-info-circle ms-2 filter-tooltip-icon"
            ></i>
          </h5>

          <button
            className="btn btn-outline-primary w-100"
            onClick={toggleModal}
          >
            {t("Click here to select attributes")}
          </button>
        </div>
        <Divider />
        <div className="child-container-two pt-2">
          <h5 className="fw-bold">
            <Translation>{(t) => t("Permission")}</Translation>{" "}
            <i
              title={t(
                "This section is aimed to set read\npermissions for the filter"
              )}
              className="fa fa-info-circle filter-tooltip-icon"
            ></i>
          </h5>
          <input
            className="access-all"
            type="radio"
            id="all-users"
            name="my-radio"
            value={ACCESSIBLE_FOR_ALL_GROUPS}
            checked={permissions === ACCESSIBLE_FOR_ALL_GROUPS}
            onChange={(e) => setPermissions(e.target.value)}
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
          />
          <label htmlFor="private-only" className="fs-18">
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
          />
          <label htmlFor="specific-grp" className="fs-18">
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
                      <ListGroup>
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
                  onClick={() => handleClickUserGroupIcon("group")}
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
                    <div
                      className="badge-deleteIcon ms-2"
                      onClick={() => setIdentifierId(null)}
                    >
                      &times;
                    </div>
                  </Badge>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <Divider />
      </List>

      <List>
        <div className="d-flex align-items-center justify-content-between">
          {selectedFilterData && (
            <button
              className="btn btn-link text-danger cursor-pointer"
              onClick={() => {
                toggleDrawer();
                handleFilterDelete();
              }}
            >
              <Translation>{(t) => t("Delete Filter")}</Translation>
            </button>
          )}
          <div className="d-flex align-items-center">
            <button
              className="btn btn-outline-secondary me-3"
              onClick={() => {
                toggleDrawer();
              }}
            >
              <Translation>{(t) => t("Cancel")}</Translation>
            </button>
            <button
              className="btn btn-primary submitButton text-decoration-none truncate-size "
              disabled={!permissions || !filterName}
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
          </div>
        </div>
      </List>
    </div>
  );
  return (
    <div>
      <React.Fragment key="left">
        <button
          onClick={() => {
            toggleDrawer();
            clearAllFilters();
          }}
          className="btn btn-link text-dark cursor-pointer"
        >
          <Translation>{(t) => t("Create New Filter")}</Translation>
        </button>
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
              onSaveTaskAttribute={onSaveTaskAttribute}
              showUndefinedVariable={showUndefinedVariable}
            />
          </div>
        )}
        <Drawer
          anchor="left"
          open={openFilterDrawer}
          onClose={() => {
            toggleDrawer();
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
    </div>
  );
}
