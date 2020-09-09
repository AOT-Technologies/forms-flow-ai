import React from "react";
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

const WorkFlow = (props) => {
  const {
    associateWorkFlow,
    changeWorkFlowStatus,
    populateDropdown,
    associateToWorkFlow,
    handleNext,
    handleBack,
    activeStep,
    steps,
  } = props;

  return (
    <Grid container direction="row" justify="flex-start" alignItems="baseline">
      {/* <FormControl component="fieldset"> */}

      <Grid item xs={9} spacing={3}>
        <h2>Work flow</h2>
      </Grid>
      <Grid item xs={3} className="next-btn">
        <SaveNext
          handleBack={handleBack}
          handleNext={handleNext}
          activeStep={activeStep}
          steps={steps}
        />
      </Grid>
      <Grid item sm={8} xs={12} spacing={3}>
        <Card variant="outlined" className="card-overflow">
          <CardContent>
            <Grid item sm={8} xs={12} spacing={3}>
              <FormLabel component="legend">
                Do you want to associate form with a workflow ?
              </FormLabel>
              <RadioGroup
                aria-label="gender"
                name="gender1"
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
              <Grid item xs={12} spacing={3}>
                <h5>Please select a process </h5>
                <Select
                  options={populateDropdown()}
                  onChange={(item) => associateToWorkFlow(item)}
                />
              </Grid>
            )}
            {/* </FormControl> */}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
  // if (workFlow) {
  //   return (
  //     <div>
  //       <div style={{ marginLeft: 320 }}>
  //         <label>
  //           <Checkbox checked={workFlow} onChange={handleCheckboxChange} />
  //           <FormControlLabel
  //             control={
  //               <Checkbox
  //                 checked={workFlow}
  //                 onChange={handleCheckboxChange}
  //                 name="Check box to associate form with a workflow"
  //                 color="primary"
  //               />
  //             }
  //             label="Check box to associate form with a workflow"
  //           />
  //           {/* <span>Check box to associate form with a workflow</span> */}
  //         </label>
  //       </div>
  //       <br></br>
  //       {/* <h5>Please select a process </h5>
  //       <Select
  //         options={this.populateDropdown()}
  //         onChange={(item) => this.associateToWorkFlow(item)}
  //       />
  //       <br></br>
  //       <div>
  //         <h5>Status</h5>
  //         <Select
  //           options={this.populateStatusDropdown()}
  //           onChange={(item) => this.setSelectedStatus(item)}
  //         />
  //       </div>
  //       <br></br>
  //       <div>
  //         <h5>Comments</h5> */}
  //       {/* <Select options={this.populateStatusDropdown()} onChange={(item) => this.setSelectedStatus(item)}/> */}
  //       {/* <textarea type="submit" value={this.state.value} /> */}
  //       {/* </div> */}
  //     </div>
  //   );
  // }

  // return (
  //   <div>
  //     <div style={{ marginLeft: 320 }}>
  //       <label>
  //         <Checkbox checked={workFlow} onChange={handleCheckboxChange} />
  //         <span>Check box to associate form with a workflow</span>
  //       </label>
  //     </div>
  //   </div>
  // );
};
export default WorkFlow;
