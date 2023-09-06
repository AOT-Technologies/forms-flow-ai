import React, { useState, useEffect, useRef } from "react";
import { Row, Col } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { useDispatch, useSelector } from "react-redux";
import AsyncSelect from "react-select/async";
import "./TaskSearchBarListView.scss";
// import { fetchServiceTaskList } from "../../../../apiManager/services/bpmTaskServices";
// import {
//     setBPMTaskLoader,
// } from "../../../../actions/bpmTaskActions";
import {
  fetchServiceTaskList,
  fetchUserListWithSearch,
} from "../../../../apiManager/services/bpmTaskServices";
import { UserSearchFilterTypes } from "../../constants/userSearchFilterTypes";
import { setBPMFilterSearchParams } from "../../../../actions/bpmTaskActions";
import { getISODateTime } from "../../../../apiManager/services/formatterService";
// import {
//     //getFormattedDateAndTime,
//     getISODateTime,
// } from "../../../../apiManager/services/formatterService";
const TaskFilterListViewComponent = React.memo(
  ({ toggleDisplayFilter, filterValues, setFilterValues }) => {
    // to update the object according to different filters
    // const[filterParams,setSetFilterParams] = useState({});
    const [followStartDate, setFollowStartDate] = useState(
      filterValues.followStartDate
    );
    const [followEndDate, setFollowEndDate] = useState(
      filterValues.followEndDate
    );
    const [dueStartDate, setDueStartDate] = useState(filterValues.dueStartDate);
    const [dueEndDate, setDueEndDate] = useState(filterValues.dueEndDate);
    const [createdStartDate, setCreatedStartDate] = useState(
      filterValues.createdStartDate
    );
    const [createdEndDate, setCreatedEndDate] = useState(
      filterValues.createdEndDate
    );
    const createSearchNode = useRef();
    const [assignee, setAssignee] = useState(filterValues.assignee);
    const [candidateGroup, setCandidateGroup] = useState(
      filterValues.candidateGroup
    );
    const [candidateUser, setCandidateUser] = useState(
      filterValues.candidateUser
    );
    const [processDefinitionName, setProcessDefinitionName] = useState(
      filterValues.processDefinitionName
    );
    const dispatch = useDispatch();
    // const [filterSelections, setFilterSelections] = useState(
    //     filterSearchSelections
    //   );

    const firstResult = useSelector((state) => state.bpmTasks.firstResult);
    const reqData = useSelector((state) => state.bpmTasks.listReqParams);
    const selectedFilter = useSelector(
      (state) => state.bpmTasks.selectedFilter
    );
    // const filterSelections = useSelector(
    //     (state) => state.bpmTasks.filterSearchSelections
    // );
    // const queryType = useSelector((state) => state.bpmTasks.searchQueryType);

    // state for updating the values in inputboxs in the filter search
    const filterSearchSelection = useSelector(
      (state) => state.bpmTasks?.filterListSearchParams
    );
    console.log("listreq params",reqData);
console.log("due data",dueStartDate);
    console.log("filterseach selection", filterSearchSelection);
    const handleClick = (e) => {
      if (createSearchNode?.current?.contains(e.target)) {
        return;
      }
      // outside click
      toggleDisplayFilter();
    };
    useEffect(() => {
      // add when mounted
      document.addEventListener("mousedown", handleClick);
      // return function to be called when unmounted
      return () => {
        document.removeEventListener("mousedown", handleClick);
      };
    }, []);
    const updateFilter = (filter) => {
      setAssignee(filter);
    };

    const applyFilters = () => {
      const filterParams = {};
      if (assignee.label) {
        filterParams["assigneeLike"] = `%${assignee.label}%`;
      }
      if (candidateUser) {
        filterParams["candidateUser"] = candidateUser;
      }
      if (candidateUser) {
        filterParams[
          "processDefinitionNameLike"
        ] = `%${processDefinitionName}%`;
      }
      if (dueStartDate) {
        console.log("getting in");
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
      if (createdEndDate) {
        filterParams["createdBefore"] = getISODateTime(createdEndDate);
      }
      dispatch(setBPMFilterSearchParams(filterParams));
      dispatch(fetchServiceTaskList(selectedFilter.id, firstResult, reqData));

    };
    // const applyFilters = () => {
    //     toggleDisplayFilter();
    //     // applyAssigneeFilter();

    //     dispatch(setBPMTaskLoader(true));

    //      const filterParams = {};
    //     if (assignee.label !== '') {
    //         filterParams.assigneeLike =  assignee.label;
    //     }
    //     if (candidateUser !== '') {
    //         filterParams.candidateUser = candidateUser;
    //     }

    //     if (processDefinitionName !== '') {
    //         filterParams.processDefinitionNameLike = '%' + processDefinitionName + '%';
    //     }
    //     if (dueStartDate !== null ) {
    //         filterParams.dueAfter = getISODateTime(dueStartDate);
    //     }
        // if (dueEndDate !== null) {
        //     filterParams.dueBefore = getISODateTime(dueEndDate);
        // }
    // if (followStartDate !== null) {
    //     filterParams.followUpAfter = getISODateTime(followStartDate);
    // }
    // if (followEndDate !== null) {
    //     filterParams.followUpBefore = getISODateTime(followEndDate);
    // }
    // if (createdStartDate !== null) {
    //     filterParams.createdAfter = getISODateTime(createdStartDate);
    // }
    // if (createdEndDate !== null) {
    //     filterParams.createdBefore = getISODateTime(createdEndDate);
    // }

    //     console.log(filterParams);
    //     if (Object.keys(filterParams).length > 0) {
    //         const reqDataparams = {
    //             ...reqData,
    //             ...filterParams
    //         };

    //         dispatch(fetchServiceTaskList(selectedFilter.id, firstResult, reqDataparams));
    //     }
    // };
    // const applyAssigneeFilter = () => {
    //     const assigneeFilter = taskFilters.find(filter => filter.key === "assignee");
    //     const updatedSelectionsArray = [...filterSelections, { ...assigneeFilter }];
    //     setFilterSelections(updatedSelectionsArray);
    //
    // };

    const clearAllFilters = () => {
      // setAssignee('');
      // setCandidateGroup('');
      // setCandidateUser('');
      // setProcessDefinitionName('');
      // setFollowStartDate(null);
      // setFollowEndDate(null);
      // setDueStartDate(null);
      // setDueEndDate(null);
      // setCreatedStartDate(null);
      // setCreatedEndDate(null);
      setFilterValues({
        assignee: "",
        candidateUser: "",
        processDefinitionName: "",
        dueStartDate: "",
        dueEndDate: "",
        followStartDate: "",
        followEndDate: "",
        createdStartDate: "",
        createdEndDate: "",
      });
    };
    const formatOptionLabel = (
      { id, firstName, lastName, email },
      { context }
    ) => {
      if (context === "value") {
        return <div className="p-2">{id}</div>;
      } else if (context === "menu") {
        return (
          <div
            className="p-2 click-element"
            style={{ display: "flex", flexDirection: "column" }}
          >
            <div>{id}</div>
            <div>{(firstName, lastName, email)}</div>
          </div>
        );
      }
    };
    const loadOptions = (inputValue = "", callback) => {
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
                  label: user.username,
                  email: user.email,
                  firstName: user.firstName,
                  id: user.username,
                  lastName: user.lastName,
                };
              });
              // setIsSearch(true);
              callback(userListOptions);
            }
          }
        )
      );
    };

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
          </Row>

          <Row className="mt-2">
            <Col>
              <label>Assignee</label>
              <AsyncSelect
                cacheOptions
                loadOptions={loadOptions}
                isClearable
                defaultOptions
                value={assignee} // Make sure to set the
                onChange={updateFilter}
                formatOptionLabel={formatOptionLabel}
              />
            </Col>
            <Col>
              <label>Candiadte Group</label>
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
              <label>Candiadte User</label>
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
                    />
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
          <hr />
          <Row className="mt-3 filter-cancel-btn-container ">
            <Col className="text-left">
              <span className=" text-danger" onClick={clearAllFilters}>
                Clear All Filters
              </span>
            </Col>
            <Col className="text-right">
              <button
                className="btn btn-light mr-1 "
                onClick={toggleDisplayFilter}
              >
                Cancel
              </button>
              <button className="btn btn-dark" onClick={applyFilters}>
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
