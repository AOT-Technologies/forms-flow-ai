import React, { useState, useEffect, useRef } from "react";
import { Row, Col } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { useDispatch, useSelector } from "react-redux";
import "./TaskSearchBarListView.scss";
// import { fetchServiceTaskList } from "../../../../apiManager/services/bpmTaskServices";
import {
    setBPMTaskLoader,
} from "../../../../actions/bpmTaskActions";
import {
 //fetchServiceTaskList,
  fetchUserListWithSearch,
} from "../../../../apiManager/services/bpmTaskServices";
import { UserSearchFilterTypes } from "../../constants/userSearchFilterTypes";
import { setBPMFilterSearchParams } from "../../../../actions/bpmTaskActions";
import { getISODateTime } from "../../../../apiManager/services/formatterService";
const TaskFilterListViewComponent = React.memo(
    ({ setDisplayFilter, setFilterParams, filterParams }) => {
    // to update the object according to different filters
    // const[filterParams,setSetFilterParams] = useState({});
    const [followStartDate, setFollowStartDate] = useState(
        filterParams.followStartDate || null
    );
    const [followEndDate, setFollowEndDate] = useState(
      filterParams.followEndDate || null
    );
    const [dueStartDate, setDueStartDate] = useState(filterParams.dueStartDate || null);
    const [dueEndDate, setDueEndDate] = useState(filterParams.dueEndDate || null);
    const [createdStartDate, setCreatedStartDate] = useState(
      filterParams.createdStartDate || null 
    );
    const [createdEndDate, setCreatedEndDate] = useState(
      filterParams.createdEndDate || null 
    );
    const createSearchNode = useRef();
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
        const dispatch = useDispatch();
        const [filterCount, setFilterCount] = useState(0);
        const [options, setOptions] = useState([]);
        // const [filterParams, setFilterParams] = useState({});
    // const [filterSelections, setFilterSelections] = useState(
    //     filterSearchSelections
    //   );

    // const firstResult = useSelector((state) => state.bpmTasks.firstResult);
    // const reqData = useSelector((state) => state.bpmTasks.listReqParams);
    // const selectedFilter = useSelector(
    //   (state) => state.bpmTasks.selectedFilter
    // );
    // const filterSelections = useSelector(
    //     (state) => state.bpmTasks.filterSearchSelections
    // );
    // const queryType = useSelector((state) => state.bpmTasks.searchQueryType);

    // state for updating the values in inputboxs in the filter search
    const filterSearchSelection = useSelector(
      (state) => state.bpmTasks?.filterListSearchParams
    );
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
     // dispatch(fetchServiceTaskList(selectedFilter.id, firstResult, reqData));
      setFilterCount(Object.keys(filterParams).length);
      setDisplayFilter(false);            
        };
    useEffect(() => {
        // Update filterCount whenever filterParams changes
        setFilterCount(Object.keys(filterParams).length);
    }, [filterParams]);
    const clearAllFilters = () => {
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
            setOptions(userListOptions);
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
          className="Filter-listview"
          style={{ minWidth: "700px" }}
          ref={createSearchNode}
        >
          <Row className="border-bottom" style={{ margin: "auto" }}>
            <span className="font-weight-bold" style={{ marginRight: "auto" }}>
              Filters
                    </span> 
                    <span className="font-weight-bold" style={{marginLeft:"auto"}}>
                        Filter count : {filterCount}
                    </span>
          </Row>

          <Row className="mt-2">
            <Col>
              <label>Assignee</label>
              <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="form-control"
              >
                  <option value="">Select a user</option>
                  {options.map((option) => (
                      <option key={option.value} value={option.value}>
                          {option.label}
                      </option>
                  ))}
              </select>
            </Col>
            <Col>
              <label>Candidate Group</label>
              <input
                className="form-control"
                placeholder=""
                value={candidateGroup}
                onChange={(e) => setCandidateGroup(e.target.value)}
              />
            </Col>
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
            <Col xs={6}>
              <label>Due Date</label>
              <Row>
                <Col xs={6}>
                  <DatePicker
                    placeholderText="From"
                    showTimeSelect
                    selected={
                      filterSearchSelection.dueAfter
                        ? new Date(filterSearchSelection.dueAfter)
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
                    selected={ filterSearchSelection.dueBefore
                        ? new Date(filterSearchSelection.dueBefore) : dueEndDate}
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
            <Col xs={6}>
              <label>Follow up Date</label>
              <div>
                <Row>
                  <Col xs={6}>
                    <DatePicker
                      placeholderText="From"
                      showTimeSelect
                      selected={filterSearchSelection.followUpAfter
                        ? new Date(filterSearchSelection.followUpAfter) : followStartDate}
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
                      selected={filterSearchSelection.followUpBefore
                        ? new Date(filterSearchSelection.followUpBefore) : followEndDate}
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
          </Row>
          <Row className="mt-2">
            <Col xs={6}>
              <label> Created Date</label>
              <div>
                <Row>
                  <Col xs={6}>
                    <DatePicker
                      placeholderText="From"
                      showTimeSelect
                      selected={filterSearchSelection.createdAfter
                        ? new Date(filterSearchSelection.createdAfter) : createdStartDate}
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
                      selected={filterSearchSelection.createdBefore
                        ? new Date(filterSearchSelection.createdBefore) : createdEndDate}
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
          </Row>
          <hr />
          <Row className="mt-3 filter-cancel-btn-container ">
            <Col className="text-left">
              <span className=" text-danger" onClick={()=>clearAllFilters()}>
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
