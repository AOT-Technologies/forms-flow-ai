import React, { useState, useEffect, useRef } from "react";
import { Row, Col } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { useDispatch, useSelector } from "react-redux";
import cloneDeep from "lodash/cloneDeep";
import "./TaskSearchBarListView.scss";
import { setBPMTaskLoader } from "../../../../actions/bpmTaskActions";
import { fetchUserListWithSearch } from "../../../../apiManager/services/bpmTaskServices";
import { UserSearchFilterTypes } from "../../constants/userSearchFilterTypes";
import { setBPMFilterSearchParams } from "../../../../actions/bpmTaskActions";
import { getISODateTime } from "../../../../apiManager/services/formatterService";
import { MAX_VARIABLES_PER_ROW } from "../../constants/taskConstants";
import { useTranslation } from "react-i18next"; 

const TaskFilterViewComponent = React.memo(
  ({ setDisplayFilter, setFilterParams, filterParams }) => {
    const vissibleAttributes = useSelector(
      (state) => state.bpmTasks.vissibleAttributes
    );
    const [assignee, setAssignee] = useState(filterParams.assignee || "");
    const [candidateGroup, setCandidateGroup] = useState(
      filterParams.candidateGroup || ""
    );
    const [processVariables, setProcessVariables] = useState(
      filterParams?.processVariables || []
    );
    const [dueStartDate, setDueStartDate] = useState(
      filterParams.dueStartDate || null
    );
    const [dueEndDate, setDueEndDate] = useState(
      filterParams.dueEndDate || null
    );
    const [followStartDate, setFollowStartDate] = useState(
      filterParams.followStartDate || null
    );
    const [followEndDate, setFollowEndDate] = useState(
      filterParams.followEndDate || null
    );
    const [createdStartDate, setCreatedStartDate] = useState(
      filterParams.createdStartDate || null
    );
    const [createdEndDate, setCreatedEndDate] = useState(
      filterParams.createdEndDate || null
    );
    const [priority, setPriority] = useState(filterParams.priority || null);
    const createSearchNode = useRef();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [assigneeOptions, setAssigneeOptions] = useState([]);
    const [inputValuesPresent, setInputValuesPresent] = useState(false); // State to track any input value is present or not

    const handleClick = (e) => {
      if (createSearchNode?.current?.contains(e.target)) {
        return;
      }
      // outside click
      setDisplayFilter(false);
    };

    useEffect(() => {
      // add when mounted
      document.addEventListener("mousedown", handleClick);
      // return function to be called when unmounted
      return () => {
        document.removeEventListener("mousedown", handleClick);
      };
    }, []);

    const handleProcessVariables = (name, value) => {
      setProcessVariables((prevProcessVariables) => {
        if(name === 'applicationId'){
          value = Number(value);
        }

        if (Array.isArray(prevProcessVariables)) {
          const existingVariableIndex = prevProcessVariables?.findIndex(
            (variable) => variable?.name === name
          );

          if (existingVariableIndex !== -1) {
            // If a variable with the same name exists, update its value
            const updatedProcessVariables = [...prevProcessVariables];
            updatedProcessVariables[existingVariableIndex].value = value;

            return updatedProcessVariables;
          } else {
            // If no variable with the same name exists, create a new one
            return [
              ...prevProcessVariables,
              {
                name: name,
                operator: "eq",
                value: value,
              },
            ];
          }
        } else {
          // If prevProcessVariables is not an array or is undefined, initialize it as an empty array.
          return [
            {
              name: name,
              operator: "eq",
              value: value,
            },
          ];
        }
      });
    };

    const applyFilters = () => {
      dispatch(setBPMTaskLoader(true));
      const updatedfilterParams = {...cloneDeep(filterParams)};
      if (assignee) {
        updatedfilterParams["assignee"] = assignee;
      }
      if (candidateGroup) {
        updatedfilterParams["candidateGroup"] = candidateGroup;
      }
      if (priority) {
        updatedfilterParams["priority"] = priority;
      }
      if (processVariables) {
        updatedfilterParams["processVariables"] = processVariables;
      }
      if (dueStartDate) {
        updatedfilterParams["dueAfter"] = getISODateTime(dueStartDate);
      }
      if (dueEndDate) {
        updatedfilterParams["dueBefore"] = getISODateTime(dueEndDate);
      }
      if (followStartDate) {
        updatedfilterParams["followUpAfter"] = getISODateTime(followStartDate);
      }
      if (followEndDate) {
        updatedfilterParams["followUpBefore"] = getISODateTime(followEndDate);
      }
      if (createdStartDate) {
        updatedfilterParams["createdAfter"] = getISODateTime(createdStartDate);
      }
      if (createdEndDate) {
        updatedfilterParams["createdBefore"] = getISODateTime(createdEndDate);
      }

      dispatch(setBPMFilterSearchParams(updatedfilterParams));
      setFilterParams(updatedfilterParams);
      setDisplayFilter(false);
    };

    //To disable the show results & clear filter btn if there no input values
    useEffect(() => {
      setInputValuesPresent(
       ( assignee || candidateGroup || processVariables?.length || dueStartDate || dueEndDate ||
          followStartDate || followEndDate || createdStartDate || createdEndDate ||
          priority || Object.keys(filterParams)?.length)
      );
    }, [assignee, candidateGroup, processVariables, dueStartDate, dueEndDate,
      followStartDate, followEndDate, createdStartDate, createdEndDate, priority]);
      
    const clearAllFilters = () => {
      setAssignee("");
      setCandidateGroup("");
      setProcessVariables(null);
      setPriority("");
      setDueStartDate(null);
      setDueEndDate(null);
      setFollowStartDate(null);
      setFollowEndDate(null);
      setCreatedStartDate(null);
      setCreatedEndDate(null);
      setFilterParams({});
      dispatch(setBPMFilterSearchParams({}));
    };

    const DatepickerCustomInput = React.forwardRef(
      ({ value, onClick, placeholder }, ref) => {
        return (
          <div className="input-group">
            <input
              value={value}
              className="example-custom-input form-control"
              onClick={onClick}
              ref={ref}
              placeholder={placeholder}
            />
            <div className="input-group-prepend">
              <span className="input-group-text p-2">
                <i className="fa fa-calendar" />
              </span>
            </div>
          </div>
        );
      }
    );
    const loadOptions = (inputValue = "") => {
      dispatch(
        fetchUserListWithSearch(
          {
            searchType: UserSearchFilterTypes[0].searchType,
            query: inputValue,
          },
          (err, res) => {
            if (!err) {
              const userListOptions = res.map((user) => {
                return {
                  value: user.username,
                  label: `${user.firstName ? user.firstName : ""} ${user.lastName ? user.lastName : ""} (${user.username})`,
                };
              });
              setAssigneeOptions(userListOptions);
            }
          }
        )
      );
    };
    useEffect(() => {
      loadOptions();
    }, []);

    return (
      <>
        <div
          className="filter-listview "
          ref={createSearchNode}
        >
          <div className="bg-light ">
            <Row
              className="px-4 py-2 d-flex justify-content-between align-items-center mx-auto"
            >
              <span className="fw-bold ">{t("Search")}</span>
            </Row>
          </div>
          <hr className="m-0 w-100" />
          <div className="m-4 px-2">
            <Row className="mt-2">
              {vissibleAttributes.taskVisibleAttributes?.assignee && (
                <Col xs={6}>
                  <label>{t("Assignee")}</label>
                  <select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="form-select w-100 text-dark"
                  >
                    <option value="" hidden>
                      {t("Select a user")}
                    </option>
                    {assigneeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Col>
              )}
              {vissibleAttributes.taskVisibleAttributes?.priority && (
                <Col xs={6}>
                  <label htmlFor="priority">{t("Priority")}</label>
                  <input
                    id="priority"
                    className="form-control"
                    placeholder=""
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  />
                </Col>
              )}
            </Row>
            {vissibleAttributes.variables
              ?.reduce((rows, e, i) => {
                const variable = processVariables?.find(
                  (variable) => variable.name === e.name
                );

                if (i % MAX_VARIABLES_PER_ROW === 0) {
                  rows.push([]);
                }

                rows[rows.length - 1].push(
                  <Col  key={i} xs={6}>
                    <label>{e.label === 'Application Id' ? 'Submission Id' : e.label}</label>
                    <input
                      title={t("Task variables")}
                      className="form-control"
                      placeholder=""
                      name={e.name}
                      value={variable ? variable.value : ""}
                      onChange={(e) =>
                        handleProcessVariables(e.target.name, e.target.value)
                      }
                    />
                  </Col>
                );

                return rows;
              }, [])
              .map((row, i) => (
                <Row key={i} className="mt-2">
                  {row}
                </Row>
              ))}
            <Row className="mt-2 ">
              {vissibleAttributes.taskVisibleAttributes?.dueDate && (
                <Col xs={6}>
                  <label>{t("Due Date")}</label>
                  <Row>
                    <Col xs={6}>
                      <DatePicker
                        placeholderText="From"
                        showTimeSelect
                        selected={
                          filterParams.dueAfter
                            ? new Date(filterParams.dueAfter)
                            : dueStartDate
                        }
                        onChange={(date) => setDueStartDate(date)}
                        selectsStart
                        startDate={dueStartDate}
                        endDate={dueEndDate}
                        customInput={<DatepickerCustomInput />}
                      />
                    </Col>
                    <Col xs={6}>
                      <DatePicker
                        placeholderText="To"
                        showTimeSelect
                        selected={
                          filterParams.dueBefore
                            ? new Date(filterParams.dueBefore)
                            : dueEndDate
                        }
                        onChange={(date) => setDueEndDate(date)}
                        selectsEnd
                        startDate={dueStartDate}
                        endDate={dueEndDate}
                        minDate={dueStartDate}
                        customInput={<DatepickerCustomInput />}
                      />
                    </Col>
                  </Row>
                </Col>
              )}
              {vissibleAttributes.taskVisibleAttributes?.followUp && (
                <Col xs={6}>
                  <label>{t("Follow up Date")}</label>
                  <div>
                    <Row>
                      <Col xs={6}>
                        <DatePicker
                          placeholderText="From"
                          showTimeSelect
                          selected={
                            filterParams.followUpAfter
                              ? new Date(filterParams.followUpAfter)
                              : followStartDate
                          }
                          onChange={(date) => setFollowStartDate(date)}
                          selectsStart
                          startDate={followStartDate}
                          endDate={followEndDate}
                          customInput={<DatepickerCustomInput />}
                        />
                      </Col>
                      <Col xs={6} max>
                        <DatePicker
                          placeholderText="To"
                          showTimeSelect
                          selected={
                            filterParams.followUpBefore
                              ? new Date(filterParams.followUpBefore)
                              : followEndDate
                          }
                          onChange={(date) => setFollowEndDate(date)}
                          selectsEnd
                          startDate={followStartDate}
                          endDate={followEndDate}
                          minDate={followStartDate}
                          customInput={<DatepickerCustomInput />}
                        />
                      </Col>
                    </Row>
                  </div>
                </Col>
              )}
            </Row>
            <Row className="mt-2">
              {vissibleAttributes.taskVisibleAttributes?.createdDate && (
                <Col xs={6}>
                  <label> {t("Created Date")}</label>
                  <div>
                    <Row>
                      <Col xs={6}>
                        <DatePicker
                          placeholderText="From"
                          showTimeSelect
                          selected={
                            filterParams.createdAfter
                              ? new Date(filterParams.createdAfter)
                              : createdStartDate
                          }
                          onChange={(date) => setCreatedStartDate(date)}
                          selectsStart
                          startDate={createdStartDate}
                          endDate={createdEndDate}
                          customInput={<DatepickerCustomInput />}
                        />
                      </Col>
                      <Col xs={6} max>
                        <DatePicker
                          placeholderText="To"
                          showTimeSelect
                          selected={
                            filterParams.createdBefore
                              ? new Date(filterParams.createdBefore)
                              : createdEndDate
                          }
                          onChange={(date) => setCreatedEndDate(date)}
                          selectsEnd
                          startDate={createdStartDate}
                          endDate={createdEndDate}
                          minDate={createdStartDate}
                          customInput={<DatepickerCustomInput />}
                        />
                      </Col>
                    </Row>
                  </div>
                </Col>
              )}
            </Row>
          </div>
          <hr className="mx-4" />
          <Row className="m-3 filter-cancel-btn-container ">
            <Col className="text-left">
              <button
                className="btn btn-link text-danger"
                onClick={() => clearAllFilters()}
                disabled={!inputValuesPresent} 
              >
                {t("Clear All Filters")}
              </button>
            </Col>
            <Col className="text-end">
              <button
                className="btn btn-light me-1 "
                onClick={() => setDisplayFilter(false)}
              >
                {t("Cancel")}
              </button>
              <button disabled={!inputValuesPresent} className="btn btn-dark" onClick={() => applyFilters()}>
                {t("Show results")}
              </button>
            </Col>
          </Row>
        </div>
      </>
    );
  }
);

export default TaskFilterViewComponent;
