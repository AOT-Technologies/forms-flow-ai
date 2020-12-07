import React from "react";
/*import { Button } from 'reactstrap';*/
import {
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
  Grid,
  CardContent,
  Card,
} from "@material-ui/core";
import Select from "react-dropdown-select";
import SaveNext from "./SaveNext";
import ProcessDiagram from "../../BPMN/ProcessDiagram";

const WorkFlow = (props) => {

  const {
    associateWorkFlow,
    changeWorkFlowStatus,
    populateDropdown,
    associateToWorkFlow,
    handleNext,
    handleBack,
    handleEditAssociation,
    activeStep,
    steps,
    workflow,
    disableWorkflowAssociation
  } = props;


  return (
    <Grid container direction="row" justify="flex-start" alignItems="baseline">
      {/* <FormControl component="fieldset"> */}

      <Grid item xs={12} sm={1} spacing={3}>
       <button className="MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary" onClick={handleEditAssociation}>Edit</button>
      </Grid>
      <Grid item xs={12} sm={8} spacing={3}/>
      <Grid item xs={12} sm={3} className="next-btn">
        <SaveNext
          handleBack={handleBack}
          handleNext={handleNext}
          activeStep={activeStep}
          steps={steps}
        />
      </Grid>
      <Grid item xs={12} sm={12} spacing={3}><br/></Grid>
      <Grid item xs={12} sm={12} spacing={3} disabled={disableWorkflowAssociation}>
        <Card variant="outlined" className="card-overflow">
          <CardContent>
            <Grid item xs={12} sm={12} spacing={3}>
              <FormLabel component="legend">
                Do you want to associate form with a workflow ?
              </FormLabel>
              <RadioGroup
                aria-label="associateWorkFlow"
                name="associateWorkFlow"
                value={associateWorkFlow}
                onChange={changeWorkFlowStatus}
                row
              >
                <FormControlLabel
                  value="yes"
                  control={<Radio color="primary" />}
                  label="Yes"
                />
                <FormControlLabel
                  value="no"
                  control={<Radio color="primary" />}
                  label="No"
                />
              </RadioGroup>
            </Grid>

            {associateWorkFlow === "yes" && (
              <>
                <Grid item xs={12} sm={6} spacing={3}>
                  <h5> Please select from one of the following workflows. </h5>
                  <Select
                    options={populateDropdown()}
                    onChange={(item) => associateToWorkFlow(item)}
                    values={workflow && workflow.value ? [workflow] : []}
                    disabled={disableWorkflowAssociation}
                  />
                </Grid>
                <Grid item xs={12} sm={6} spacing={3}/>
                <br/>
                {workflow && workflow.value && (
                  <Grid item xs={12} spacing={3}>
                    <ProcessDiagram
                      process_key={workflow && workflow.value}
                    />
                  </Grid>
                )}
              </>
            )}
            {/* </FormControl> */}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
export default WorkFlow;
