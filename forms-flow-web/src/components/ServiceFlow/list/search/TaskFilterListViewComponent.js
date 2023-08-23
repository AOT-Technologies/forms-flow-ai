
import React,{ useState } from "react";
import { Row,Col, } from "react-bootstrap";
import DatePicker from "react-datepicker";
import  "./TaskSearchBarListView.scss";
const TaskFilterListViewComponent = React.memo(({toggleDisplayFilter}) => {

const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [assignee, setAssignee] = useState('');
    const [candidateGroup, setCandidateGroup] = useState('');
    const [candidateUser, setCandidateUser] = useState('');
    const [processDefinitionName, setProcessDefinitionName] = useState('');

    
    const applyFilters = () => {
        
    };
    const clearAllFilters = () => {
        setAssignee('');
        setCandidateGroup('');
        setCandidateUser('');
        setProcessDefinitionName('');
        setStartDate(null);
        setEndDate(null);
    };

  return (
      <>
          <div className="Filter-listview" style={{ minWidth: "700px"}}>
              <Row className="border-bottom" style={{ margin: "auto" }}>
                  <span className="font-weight-bold" style={{ marginRight: "auto"}} >
                      Filters
                  </span>
                  <span className="font-weight-light"
                      style={{ marginLeft: "auto" }}
                      onClick={clearAllFilters}
                  >
                     Clear All Filters
                  </span>
                  
              </Row> 
              
              <Row className="mt-2">
                  <Col>
                      <label>Assignee</label>
                      <input
                          className="form-control"
                          placeholder=""
                          value={assignee}
                          onChange={(e) => setAssignee(e.target.value)}
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
              <Row className="mt-2 filter-cancel-btn-container ">
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
