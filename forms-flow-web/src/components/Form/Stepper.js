import React, { Component } from 'react';  
import Stepper from '@material-ui/core/Stepper';  
import Step from '@material-ui/core/Step';  
import StepLabel from '@material-ui/core/StepLabel';  
import Button from '@material-ui/core/Button';  
import Typography from '@material-ui/core/Typography';  
import AppBar from '@material-ui/core/AppBar';  
import Toolbar from '@material-ui/core/Toolbar';  
import { Checkbox } from '@material-ui/core';
import Select from 'react-dropdown-select'



class StepperPage extends Component{
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
        return ['Associated with workflow?', 'Address'];  
      }  
        
    getStepContent(step) {  
        switch (step) {  
          case 0:  
            return(
                <div>
                    <label>
                        <Checkbox
                            checked={this.state.checked}
                            onChange={this.handleCheckboxChange}
                        />
                        <span>Check box to associate form with a workflow</span>
                    </label>
                </div>
            );
          case 1:  
            if(this.state.checked){
                return(
                    <div>
                        <Select options={[{value: 'workflow1', label: 'Covid-19 Flow'}, {value: 'workflow2', label: 'Email Flow'}]} 
                        onChange={(val) => this.setState({workflow: val})} 
                        />
                    </div>
                )
            }  
            else{
                return(
                    <div>
                        <Button  
                        variant="contained"  
                        color="primary"  
                        onClick={console.log('save')}  
                        >  
                        Save Form  
                        </Button>
                    </div>
                )
            }
          default:  
            return 'Unknown step';  
        }  
      }  
    
    render(){  

        const steps = this.getSteps();
        
       
        const handleNext = () => {      
          this.setActiveStep(this.state.activeStep + 1);  
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
              <Toolbar style={{ 'paddingLeft': "600px" }}>  
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
                  
                  <div>  
                    <Button disabled={this.state.activeStep === 0} onClick={handleBack} >  
                      Back  
                    </Button>   
        
                    <Button  
                      variant="contained"  
                      color="primary"  
                      onClick={handleNext}  
                      
                    >  
                      {this.state.activeStep === steps.length - 1 ? 'Finish' : 'Next'}  
                    </Button>  
                  </div>  
                </div>  
              )}  
            </div>  
          </div>  
          </>  
        );  
      }
}

export default StepperPage;
