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
import Select from 'react-dropdown-select';
import Create from './Create.js';
import Preview from './Item/Preview.js';
import { fetchAllBpmProcesses } from '../../apiManager/services/processServices';
import { saveFormProcessMapper } from '../../apiManager/services/formServices';
import { saveForm, selectError,  Errors } from 'react-formio';
import { SUBMISSION_ACCESS } from '../../constants/constants';
import { push } from 'connected-react-router';


class StepperPage extends Component{
    UNSAFE_componentWillMount() {
      this.props.getAllProcesses();
    }

    constructor(props){
        super(props)
        this.state = {checked: false, activeStep: 0, workflow: null, status: null, previewMode: false}
        this.setPreviewMode = this.setPreviewMode.bind(this);
        this.handleNext = this.handleNext.bind(this);
    }

   
    setActiveStep(val){
        this.setState({activeStep: val})
    }
    setPreviewMode(val){
      this.setState({previewMode: val})
  }
    handleCheckboxChange = event =>
    this.setState({ checked: event.target.checked })

    getSteps() {  
        return ['Create Form', 'Associate this form with a workflow?','Preview and Conform'];  
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

    populateStatusDropdown(){

      const statusList = ["Active","Inactive","Annonymous"]

      const statusDropdown = (statusList) => {
        const data = statusList.map((status) => {
          return {
            label: status,
            value: status,
          };
        });
        return data;
      };
   
      return statusDropdown(statusList);
    }

    associateToWorkFlow(item){
      console.log(item[0].value)
      this.setState({workflow: item[0]})
      //code to link form to a workflow

    }
     handleNext  ()  {  
      this.setState(prevState =>({
        activeStep:prevState.activeStep + 1
        // console.log("formdata>>>>>"+data)
        // const data = {
        //    "formId": "5f1993f28dc3a1b73ae6b6bf",
        //    "formName": "New RPAS Self Assessment Form",
        //     "formRevisionNumber": "V1" ,
        //     "processKey": this.state.workflow.value,
        //      "processName": this.state.workflow.label,
        //      "status": this.state.status.value,
        //      "comments": "test 5555"
        //      },
    }))    
   }; 
    setSelectedStatus(item){
      console.log(item[0].value)
      this.setState({status: item[0]})
      //code to link form to a workflow

    }
        
    getStepContent(step) {  
      const {previewMode} = this.state;
        switch (step) {  
          case 0:  
            // return(
              // previewMode ? <Preview/> : <Create/> ;
              if(previewMode){
                return <Preview handleNext={this.handleNext} />
              }
              return <Create setPreviewMode={this.setPreviewMode}/>    
            break;
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
                        <Select options={this.populateStatusDropdown()} onChange={(item) => this.setSelectedStatus(item)}/>
                      </div>
                    </div> 
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
        
       
        // const handleNext = () => {      
        //   this.setActiveStep(this.state.activeStep + 1); 
        //   // this.props.saveForm(null);
        //   if(this.state.activeStep === steps.length - 1){
        //     // if(this.state.checked){
        //     //   const data = {
        //     //     "formId": "5f1993f28dc3a1b73ae6b6bf",
        //     //     "formName": "New RPAS Self Assessment Form",
        //     //     "formRevisionNumber": "V1" ,
        //     //     "processKey": this.state.workflow.value,
        //     //     "processName": this.state.workflow.label,
        //     //     "status": this.state.status.value,
        //     //     "comments": "test 5555"
        //     //   };
        //     //   this.props.onSaveFormProcessMapper(data);
        //     // }else{
        //     //   console.log('do nothing for now');
        //     // }
          
        //   } 
        // };  
        
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
                        onClick={this.handleNext}  
                      >  
                        {this.state.activeStep === steps.length - 1 ? 'Save' : 'Next'}  
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
    form: { display: 'form' },
    saveText: 'Next',
    errors: selectError('form', state),
    processList: state.process.processList,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getAllProcesses: () => {
      dispatch(
        fetchAllBpmProcesses((err, res) => {
          if (!err) {
           console.log(err);
          }
        })
      )
    },
    onSaveFormProcessMapper: (data) => {
      dispatch(
        saveFormProcessMapper(data, (err, res) => {
          if (!err) {
           console.log(err);
          }
        })
      );
    },
    saveForm: (form) => { 
      console.log('inside save stepper'); 
      const newForm = {
        ...form,
        tags: ['common'],
      };
      newForm.submissionAccess = SUBMISSION_ACCESS;
      dispatch(saveForm('form', newForm, (err, form) => {
        if (!err) {
          dispatch(push(`/form/${form._id}/preview`))
        }
      }))
    }
  };
};


export default connect(mapStateToProps,mapDispatchToProps)(StepperPage);
