import React, { useState, useEffect, useRef } from "react";
import { Row, Col } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { useDispatch, useSelector } from "react-redux";
import "./TaskSearchBarListView.scss";
import {
    setBPMTaskLoader,
} from "../../../../actions/bpmTaskActions";
import {
  fetchUserListWithSearch,
} from "../../../../apiManager/services/bpmTaskServices";
import { UserSearchFilterTypes } from "../../constants/userSearchFilterTypes";
import { setBPMFilterSearchParams } from "../../../../actions/bpmTaskActions";
import { getISODateTime } from "../../../../apiManager/services/formatterService";
const TaskFilterListViewComponent = React.memo(({
    setDisplayFilter, setFilterParams, filterParams }) => {
    const vissibleAttributes = useSelector((state) => state.bpmTasks.vissibleAttributes);
    const [assignee, setAssignee] = useState(filterParams.assignee || "");
    const [candidateGroup, setCandidateGroup] = useState(
        filterParams.candidateGroup || ""
    );
    const [candidateUser, setCandidateUser] = useState(
        filterParams.candidateUser || ""
    );
    const [processDefinitionName, setProcessDefinitionName] = useState(
        filterParams.processDefinitionName || ""
    );
    const [dueStartDate, setDueStartDate] = useState(filterParams.dueStartDate || null);
    const [dueEndDate, setDueEndDate] = useState(filterParams.dueEndDate || null);
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
    const createSearchNode = useRef();
    const dispatch = useDispatch();
    const [filterCount, setFilterCount] = useState(0);
    const [assigneeOptions, setAssigneeOptions] = useState([]);
      
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

    const applyFilters = () => {
     dispatch(setBPMTaskLoader(true));
      if (assignee) {
        filterParams["assignee"] = assignee;
      }
      if (candidateGroup) {
        filterParams["candidateGroup"] = candidateGroup;
      }
      if (candidateUser) {
        filterParams["candidateUser"] = candidateUser;
      }
      if (processDefinitionName) {
        filterParams[
          "processDefinitionName"
        ] = processDefinitionName;
      }
      if (dueStartDate) {
        filterParams["dueAfter"] = getISODateTime(dueStartDate);
      }
      if (dueEndDate) {
        filterParams['dueBefore'] = getISODateTime(dueEndDate);
    }
      if (followStartDate) {
        filterParams["followUpAfter"] = getISODateTime(followStartDate);
      }
      if (followEndDate) {
        filterParams["followUpBefore"] = getISODateTime(followEndDate);
      }
      if (createdStartDate) {
        filterParams["createdAfter"] = getISODateTime(createdStartDate); 
      }
      if (createdEndDate ) {
        filterParams["createdBefore"] = getISODateTime(createdEndDate);
      }
      dispatch(setBPMFilterSearchParams(filterParams));
      setFilterCount(Object.keys(filterParams).length);
      setDisplayFilter(false);            
        };
    useEffect(() => {
        // Update filterCount whenever filterParams changes
        setFilterCount(Object.keys(filterParams).length);
    }, [filterParams]);
    const clearAllFilters = () => {
      setAssignee("");
      setProcessDefinitionName("");
      setCandidateGroup("");
      setCandidateUser("");
      setDueStartDate(null);
      setDueEndDate(null);
      setFollowStartDate(null);
      setFollowEndDate(null);
      setCreatedStartDate(null);
      setCreatedEndDate(null);
      setFilterParams({});
      dispatch(setBPMFilterSearchParams(filterParams));
    };
        
   const DatepickerCustomInput = React.forwardRef(({ value, onClick, placeholder }, ref) => {
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
                        <span className="input-group-text">
                            <i className="fa fa-calendar" />
                        </span>
                    </div>
                </div>
            );
        });
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
                label: `${user.firstName} ${user.lastName} (${user.username})`,
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
          className="Filter-listview "
          style={{ minWidth: "700px" }}
          ref={createSearchNode}
            >
        <div className="bg-light ">
           <Row className="px-4 py-2" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "auto" }}>
             <span className="font-weight-bold ">Filters</span>
             <span className="font-weight-bold">Filter count: {filterCount}</span>
         </Row> 
        </div>
         <hr className="m-0 w-100"/>
         <div className="m-4 px-2">
            <Row className="mt-2" >
           { vissibleAttributes.taskVisibleAttributes?.assignee && <Col>
              <label>Assignee</label>
              <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="form-control"
              >
                  <option value="">Select a user</option>
                  {assigneeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                          {option.label}
                      </option>
                  ))}
              </select>
            </Col>}
          {vissibleAttributes.taskVisibleAttributes?.groups &&  <Col>
              <label>Candidate Group</label>
              <input
                className="form-control"
                placeholder=""
                value={candidateGroup}
                onChange={(e) => setCandidateGroup(e.target.value)}
              />
            </Col>}
          </Row>
          <Row className="mt-2">
            <Col>
              <label>Candidate User</label>
              <input
                className="form-control"
                placeholder=""
                value={candidateUser}
                onChange={(e) => setCandidateUser(e.target.value)}
              />
            </Col>
            <Col>
              <label>Process definition name</label>
              <input
                className="form-control"
                placeholder=""
                value={processDefinitionName}
                onChange={(e) => setProcessDefinitionName(e.target.value)}
              />
            </Col>
          </Row>

          <Row className="mt-2 ">
           {vissibleAttributes.taskVisibleAttributes?.dueDate && <Col xs={6}>
              <label>Due Date</label>
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
                    selected={ filterParams.dueBefore
                       ? new Date(filterParams.dueBefore) : dueEndDate}
                    onChange={(date) => setDueEndDate(date)}
                    selectsEnd
                    startDate={dueStartDate}
                    endDate={dueEndDate}
                    minDate={dueStartDate}
                    customInput={<DatepickerCustomInput />}
                  />
                </Col>
              </Row>
            </Col>}
          {vissibleAttributes.taskVisibleAttributes?.followUp &&  <Col xs={6}>
              <label>Follow up Date</label>
              <div>
                <Row>
                  <Col xs={6}>
                    <DatePicker
                      placeholderText="From"
                      showTimeSelect
                      selected={filterParams.followUpAfter
                        ? new Date(filterParams.followUpAfter) : followStartDate}
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
                      selected={filterParams.followUpBefore
                        ? new Date(filterParams.followUpBefore) : followEndDate}
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
            </Col>}
          </Row>
          <Row className="mt-2">
          {vissibleAttributes.taskVisibleAttributes?.createdDate &&  <Col xs={6}>
              <label> Created Date</label>
              <div>
                <Row>
                  <Col xs={6}>
                    <DatePicker
                      placeholderText="From"
                      showTimeSelect
                      selected={filterParams.createdAfter
                        ? new Date(filterParams.createdAfter) : createdStartDate}
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
                      selected={filterParams.createdBefore
                        ? new Date(filterParams.createdBefore) : createdEndDate}
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
            </Col>}
          </Row>
         </div>
          <hr className="mx-4"/>
          <Row className="m-3 filter-cancel-btn-container ">
            <Col className="text-left">
              <span className="text-danger small " onClick={()=>clearAllFilters()}>
                Clear All Filters
              </span>
            </Col>
            <Col className="text-right">
              <button
                className="btn btn-light mr-1 "
                onClick={() => setDisplayFilter(false)}
              >
                Cancel
              </button>
              <button className="btn btn-dark" onClick={() => applyFilters()}>
                Show results
              </button>
            </Col>
          </Row>
        </div>
      </>
    );
  }
);

export default TaskFilterListViewComponent;
