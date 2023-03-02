import React, { useEffect, useState } from 'react';
import { Card, CardContent, Grid} from '@material-ui/core';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { listProcess } from '../../../apiManager/services/formatterService';
import ProcessDiagram from '../../BPMN/ProcessDiagramHook';
import SaveNext from "./SaveAndNext";
import Select from "react-select";
import { DEFAULT_WORKFLOW } from "../../../constants/taskConstants";
import { setBundleWorkflow } from '../../../actions/bundleActions';



const WorkflowAssociate = ({handleBack,handleNext,activeStep,steps,initialMode}) => {
  const dispatch = useDispatch();
  const process = useSelector((state) => state.process.processList);
  const workflow = useSelector((state) => state.bundle.workflowAssociated);
 
  const processList = listProcess(process);
  const [disableWorkflow, setDisableWorkflow] = useState(initialMode === "create" ? false : true);
  
  useEffect(() => {
    if (!workflow) {
      dispatch(setBundleWorkflow(DEFAULT_WORKFLOW));
    }
  }, [workflow, dispatch]);

 

  const handleListChange = (item) => {
    dispatch(setBundleWorkflow(item));
  };
 

  return (
    <Grid
    container
    direction="row"
    justify="flex-start"
    alignItems="baseline"
  >
          <div className='d-flex align-items-center justify-content-between w-100'>
          <Button variant="primary" onClick={()=>{setDisableWorkflow(false);}}>
            Edit
          </Button>
          <div>
          <SaveNext
            handleBack={handleBack}
            handleNext={handleNext}
            activeStep={activeStep}
            steps={steps}
          />
          </div>
          </div>
        
        
        <Grid item xs={12} sm={8} spacing={3} />
        
        
        <Grid item xs={12} sm={12} spacing={3}>
          <br />
        </Grid>
        
        <Grid
          item
          xs={12}
          sm={12}
          spacing={3}
          disabled={disableWorkflow}
        >
          <Card variant="outlined" className="card-overflow">
              <CardContent>
                <Grid item xs={12} sm={6} spacing={3}>
                  <span className="fontsize-16">
                    Please select from one of the following workflows.
                  </span>
                  <Select
                    options={processList}
                    onChange={handleListChange}
                    value={
                      processList.length && workflow?.value ? workflow : ""
                    }
                    disabled={disableWorkflow}
                  />
                </Grid>
                <Grid item xs={12} sm={6} spacing={3} />
                <br />
                
                  <Grid item xs={12} spacing={3}>
                    <ProcessDiagram
                      processKey={workflow?.value}
                      tenant={workflow?.tenant}
                    />
                  </Grid>
 
              </CardContent>
            </Card>
        </Grid>
  </Grid>
  );
};

export default WorkflowAssociate;