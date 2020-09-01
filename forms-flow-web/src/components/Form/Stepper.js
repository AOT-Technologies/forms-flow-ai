import React, { Component } from 'react';  
import { connect } from 'react-redux';
import Stepper from '@material-ui/core/Stepper';  
import Step from '@material-ui/core/Step';  
import StepLabel from '@material-ui/core/StepLabel';  
import Button from '@material-ui/core/Button';  
import Typography from '@material-ui/core/Typography';  
import AppBar from '@material-ui/core/AppBar';  
import Toolbar from '@material-ui/core/Toolbar';  
import { Checkbox } from '@material-ui/core';
import Select from 'react-dropdown-select'
import Create from './Create.js'
import { fetchAllBpmProcesses } from '../../apiManager/services/processServices'


class StepperPage extends Component{
    UNSAFE_componentWillMount() {
      this.props.getAllProcesses();
    }

    constructor(props){
        super(props)
        this.state = {checked: false, activeStep: 0, workflow: null}
    }

   
    setActiveStep(val){
        this.setState({activeStep: val})
    }

    handleCheckboxChange = event =>
    this.setState({ checked: event.target.checked })

    getSteps() {  
        return ['Create Form', 'Associate this form with a workflow?'];  
      }  

    populateDropdown(){

      const listProcess = (processes) => {
        if (processes.length > 0) {
          const data = processes.map((process) => {
            return {
              label: process.name,
              value: process.key,
            };
          });
          return data;
        } else {
          return [];
        }
      };
   
      return listProcess(this.props.processList);
    }

    associateToWorkFlow(item){
      console.log(item[0].value)
      this.setState({workflow: item[1]})
      //code to link form to a workflow

    }
        
    getStepContent(step) {  
        switch (step) {  
          case 0:  
            return(
              <Create></Create>
            );
          case 1: 
            if(this.state.checked){
                return(
                    <div>
                      <div style={{'marginLeft': 320}}>
                        <label>
                         <Checkbox
                            checked={this.state.checked}
                            onChange={this.handleCheckboxChange}
                          />
                          <span>Check box to associate form with a workflow</span>
                        </label>
                      </div><br></br>
                      <h5>Please select a process </h5>
                      <Select options={this.populateDropdown()} onChange={(item) => this.associateToWorkFlow(item)}/>
                      <br>
                      </br>
                      <div>
                      <h5>Status</h5>
      <select
        className="form-control"
        >
        <option value=" ">Active</option>
        <option value="new">Inactive</option>
        <option value="Username">Annonymous</option>
      </select>
    </div>
                    </div> 
                    
                  //    <div>
                  //    <div style={{'marginLeft': 320}}>
                  //      <label>
                  //        <Checkbox
                  //          checked={this.state.checked}
                  //          onChange={this.handleCheckboxChange}
                  //        />
                  //        <span>Check box to associate form with a workflow</span>
                  //      </label>
                  //    </div>
                  //    <Select options={this.populateDropdown()} onChange={(item) => this.associateToWorkFlow(item)}/>
                  //  </div>
                )
            }  
            else{
                return(
                    <div>
                      <div style={{'marginLeft': 320}}>
                        <label>
                          <Checkbox
                            checked={this.state.checked}
                            onChange={this.handleCheckboxChange}
                          />
                          <span>Check box to associate form with a workflow</span>
                        </label>
                      </div>
                    </div>
                )
            }
          default:  
            return 'Unknown step';  
        }  
      }  
    
    render(){  

        const {
          process
        } = this.props;

        const steps = this.getSteps();
        
       
        const handleNext = () => {      
          this.setActiveStep(this.state.activeStep + 1); 
          if(this.state.activeStep === steps.length - 1){
            //code to save form properly
            alert("SAVED")
          } 
        };  
        
        const handleBack = () => {  
          this.setActiveStep(this.state.activeStep - 1);  
        };  
          
        const handleReset = () => {  
          this.setActiveStep(0);  
        };  


        
        return (  
                <>  
              <AppBar position="static">  
              <Toolbar style={{ 'alignContent': "center", 'alignItems': "center", "justifyContent": "center" }}>  
              Create Form Wizard   
              </Toolbar>  
              </AppBar>  
          <div>  
            <Stepper activeStep={this.state.activeStep}>  
              {steps.map((label, index) => {   
 
                return (  
                  <Step key={label}>  
                    <StepLabel>{label}</StepLabel>  
                  </Step>  
                );  
              })}  
            </Stepper>  
            <div>  
              {this.state.activeStep === steps.length ? (  
                <div>  
                  <Typography >  
                    All steps completed - you're finished  
                  </Typography>  
                  <Button onClick={handleReset} >  
                    Reset  
                  </Button>  
                </div>  
              ) : (  
                <div>                   
                  {this.getStepContent(this.state.activeStep)}  
                  <div style={{'justifyContent': "center", 'alignItems': "center", 'marginLeft': 400}}> 
                    <div>

                      <Button disabled={this.state.activeStep === 0} onClick={handleBack} >  
                        Back  
                      </Button>   
        
                      <Button  
                        variant="contained"  
                        color="primary"  
                        onClick={handleNext}  
                      >  
                        {this.state.activeStep === steps.length - 1 ? 'Save Form' : 'Next'}  
                      </Button>
                    </div>
                  </div> 
                </div>  
              )}  
            </div>  
          </div>  
          </>  
        );  
      }
}

const mapStateToProps = (state) => {
  return {
    processList: state.process.processList,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getAllProcesses: () =>
      dispatch(
        fetchAllBpmProcesses((err, res) => {
          if (!err) {
           console.log(err);
          }
        })
      )
  }
}


export default connect(mapStateToProps,mapDispatchToProps)(StepperPage);
