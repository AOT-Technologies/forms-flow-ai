import React from 'react';
import '../../ServiceFlow.scss';

function MyComponent() {
    return (
        <div className='newFilterTask-mainContainer'>
            <div className='newFilterTaskContainer-header'><h5 style={{ fontWeight: "bold" }}>Create new filter</h5>
                <span style={{ cursor: "pointer" }}>Close</span>
            </div>
            <div className='newFilterTaskContainer'>
                <h5 style={{ fontWeight: "bold" }}>Filter Name</h5>
                <input type="text" placeholder="Enter your text here" style={{ width: "100%", height: "35px", padding: "3%" }} />
                <div className='child-container d-flex flex-column'>
                    <h5 style={{ fontWeight: "bold" }}>Criteria <i className="fa fa-info-circle"></i> </h5>
                    <h5>Definition Key Id</h5>
                    <span style={{ textDecoration: 'underline', fontSize: '14px' }} className="px-1 py-1">
                        <i className="fa fa-plus-circle" />Add Value</span>
                    <h5>Role</h5>
                    <span style={{ textDecoration: 'underline', fontSize: '14px' }} className="px-1 py-1">
                        <i className="fa fa-plus-circle" />Add Value</span>
                    <h5>User</h5>
                    <span style={{ textDecoration: 'underline', fontSize: '14px' }} className="px-1 py-1">
                        <i className="fa fa-plus-circle" />Add Value</span>
                </div>
                <div className='child-container d-flex flex-column' style={{ borderTop: "none" }}>
                    <h5 style={{ fontWeight: "bold" }}>Variable <i className="fa fa-info-circle"></i></h5>
                    <div className='d-flex '>
                        <input type="checkbox" id="my-checkbox" name="my-checkbox" value="true" />
                        <h5>Show undefined variables</h5>
                    </div>
                    <div className='d-flex'>
                        <div className='d-flex flex-column'>
                            <label>Name</label>
                            <input type='text' placeholder="Machine name of varible" style={{ width: "95%", height: "35px" }} />
                        </div>
                        <div className='d-flex flex-column'>
                            <label>Label</label>
                            <div className='d-flex gap-3'>
                                <div><input type='text' placeholder="Human readable name" style={{ width: "95%", height: "35px", '::placeholder': { fontSize: '100px' } }} /></div>
                                <div><button style={{ width: "95%", height: "35px", backgroundColor: "black", color: "white" }}>Add</button></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='child-container-two'>
                    <h5 style={{ fontWeight: "bold" }}>Permission <i className="fa fa-info-circle"></i></h5>
                    <input type='radio' id="my-radio" name="my-radio" value="true" />
                    <label>Accessible for all users</label>
                    <input type='radio' id="my-radio" name="my-radio" value="true" />
                    <label>Accessible for all Designers</label><br />
                    <input type='radio' id="my-radio" name="my-radio" value="true" />
                    <label>Private (Only You)</label><br />
                    <input type='radio' id="my-radio" name="my-radio" value="true" />
                    <label>Specific User/ Group</label> <br />

                    <div className='inside-child-container-two d-flex'>
                        <div className='user-group-divisions d-flex'>
                            <div className='d-flex flex-column'>
                                User
                                <i className="fa fa-user" style={{ fontSize: "30px" }}></i>
                            </div>
                            <div className='d-flex flex-column'>
                                Group
                                <i className="fa fa-users" style={{ fontSize: "30px" }}></i>
                            </div>
                        </div>
                        <div>
                            <label>Identifier</label>
                            <input type='text' placeholder="Enter role ID" style={{ width: "100%", height: "35px" }} />
                        </div>
                    </div>

                </div>
            </div>
            <div className='newFilterTaskContainer-footer'>
                    <span style={{ cursor: "pointer" }}>Cancel</span>
                    <button style={{marginLeft : "20px" , background :"black" , color : "white" }}>Create Filter</button>
                </div>
        </div>
    );
}

export default MyComponent;