
import React,{ useState   } from "react";
import { Row,Col, } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { useDispatch } from "react-redux";
import AsyncSelect from "react-select/async";
import "./TaskSearchBarListView.scss";

import { fetchUserListWithSearch } from "../../../../apiManager/services/bpmTaskServices";
import {
   
    UserSearchFilterTypes,
} from "../../constants/userSearchFilterTypes";

const TaskFilterListViewComponent = React.memo(({toggleDisplayFilter}) => {

const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [assignee, setAssignee] = useState('');
    const [candidateGroup, setCandidateGroup] = useState('');
    const [candidateUser, setCandidateUser] = useState('');
    const [processDefinitionName, setProcessDefinitionName] = useState('');
    const dispatch = useDispatch();
   


  
        
    const applyFilters = () => {
        console.log(assignee);
        toggleDisplayFilter();
        applyAssigneeFilter();
    };
    const applyAssigneeFilter = () => {

    };
    const clearAllFilters = () => {
        setAssignee('');
        setCandidateGroup('');
        setCandidateUser('');
        setProcessDefinitionName('');
        setStartDate(null);
        setEndDate(null);
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
                { searchType: UserSearchFilterTypes[0].searchType, query: inputValue },
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
          <div className="Filter-listview" style={{ minWidth: "700px"}}>
              <Row className="border-bottom" style={{ margin: "auto" }}>
                  <span className="font-weight-bold" style={{ marginRight: "auto"}} >
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
                          value={assignee}  // Make sure to set the value prop
                          onChange={(selectedOption) => setAssignee(selectedOption)}
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
                      <Row >
                          <Col xs={6}>
                              <DatePicker
                                  placeholderText="From"
                                  showTimeSelect
                                  selected={startDate}
                                  onChange={date => setStartDate(date)}
                                  selectsStart
                                  startDate={startDate}
                                  endDate={endDate}
                              />
                          </Col>
                          <Col xs={6}>
                              <DatePicker
                                  placeholderText="To"
                                  showTimeSelect
                                  selected={endDate}
                                  onChange={date => setEndDate(date)}
                                  selectsEnd
                                  startDate={startDate}
                                  endDate={endDate}
                                  minDate={startDate}
                              />
                          </Col>
                      </Row>
                  </Col>
                  <Col xs={6}>
                      <label>Follow up Date</label>
                      <div>
                          <Row >
                              <Col xs={6}>
                                  <DatePicker
                                      placeholderText="From"
                                      showTimeSelect
                                      selected={startDate}
                                      onChange={date => setStartDate(date)}
                                      selectsStart
                                      startDate={startDate}
                                      endDate={endDate}
                                  />
                              </Col>
                              <Col xs={6} max>
                                  <DatePicker

                                      placeholderText="To"
                                      showTimeSelect
                                      selected={endDate}
                                      onChange={date => setEndDate(date)}
                                      selectsEnd
                                      startDate={startDate}
                                      endDate={endDate}
                                      minDate={startDate}
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
                          <Row >
                              <Col xs={6}>
                                  <DatePicker
                                      placeholderText="From"
                                      showTimeSelect
                                      selected={startDate}
                                      onChange={date => setStartDate(date)}
                                      selectsStart
                                      startDate={startDate}
                                      endDate={endDate}
                                  />
                              </Col>
                              <Col xs={6} max>
                                  <DatePicker

                                      placeholderText="To"
                                      showTimeSelect
                                      selected={endDate}
                                      onChange={date => setEndDate(date)}
                                      selectsEnd
                                      startDate={startDate}
                                      endDate={endDate}
                                      minDate={startDate}
                                  />
                              </Col>
                          </Row>
                      </div>
                  </Col>
              </Row>
              <hr />
              <Row className="mt-3 filter-cancel-btn-container ">
                  <Col className="text-left">
                      <span className=" text-danger"
                          onClick={clearAllFilters}
                      >
                          Clear All Filters
                      </span>
                  </Col>
                  <Col className="text-right">
                      <button className="btn btn-light mr-1 " onClick={toggleDisplayFilter}>Cancel</button>
                      <button className="btn btn-dark" onClick={applyFilters}>Show results</button>
                  </Col>
              </Row>
              
        </div>
      </>
  );
});

export default TaskFilterListViewComponent;
