import React, { useEffect, useState } from 'react';
import { Card, CardContent, Grid, Tab, Tabs } from '@material-ui/core';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { setWorkflowAssociation } from '../../../actions/processActions';
import { listProcess } from '../../../apiManager/services/formatterService';
import ProcessDiagram from '../../BPMN/ProcessDiagramHook';
import SaveNext from "./SaveAndNext";
import Select from "react-select";
import { DEFAULT_WORKFLOW } from "../../../constants/taskConstants";



const WorkflowAssociate = ({handleBack,handleNext,activeStep,steps,disableWorkflowAssociation}) => {
  const dispatch = useDispatch();
  const process = useSelector((state) => state.process.processList);
  const workflow = useSelector((state) => state.process.workflowAssociated);
  const processList = listProcess(process);
  const [tabValue,setTabValue] = useState(0);
  const [modified,setModified] = useState(false);


  useEffect(() => {
    if (!workflow) {
      setModified(true);
      dispatch(setWorkflowAssociation(DEFAULT_WORKFLOW));
    }
  }, [workflow, dispatch]);

  const handleChange = ()=>{
    setTabValue(1);
  };

  const handleListChange = (item) => {
    setModified(true);
    dispatch(setWorkflowAssociation(item));
  };
  return (
    <Grid
    container
    direction="row"
    justify="flex-start"
    alignItems="baseline"
  >
 <Grid item xs={12} sm={1} spacing={3}>
          <Button variant="primary">
            Edit
          </Button>
        </Grid>
        <Grid item xs={12} sm={8} spacing={3} />
        
        <Grid item xs={12} sm={3} className="next-btn">
          <SaveNext
            handleBack={handleBack}
            handleNext={handleNext}
            activeStep={activeStep}
            steps={steps}
            modified={modified}
          />
        </Grid>
        <Grid item xs={12} sm={12} spacing={3}>
          <br />
        </Grid>
        <Tabs
          value={tabValue}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleChange}
        >
          <Tab label="Workflow Associate" />
        </Tabs>
        <Grid
          item
          xs={12}
          sm={12}
          spacing={3}
          // disabled={disableWorkflowAssociation}
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
                    disabled={disableWorkflowAssociation}
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
                {/* </FormControl> */}
              </CardContent>
            </Card>
        </Grid>
  </Grid>
  );
};

export default WorkflowAssociate;