import React from "react";
import {
  Checkbox,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
} from "@material-ui/core";
import Select from "react-dropdown-select";
import SaveNext from "./SaveNext";

const Preview = (props) => {
  const {
    populateStatusDropdown,
    handleNext,
    handleBack,
    activeStep,
    steps,
    processData,
    // handleAnonymous,
    setProcessData,
  } = props;
  console.log("steps", steps);
  console.log("activeStep", activeStep);

  return (
    <Grid
      container
      direction="row"
      justify="flex-start"
      alignItems="baseline"
      spacing={3}
    >
      <Grid item xs={9} spacing={3}>
        <h2>Preview and confirm</h2>
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
        <Card variant="outlined">
          <CardContent>
            <form noValidate autoComplete="off">
              <Typography variant="h5" component="h2">
                From Name
              </Typography>
              <Typography variant="h5" component="h2">
                Process Name
              </Typography>
              <div>
                <label>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={processData.isAnonymousAllowd}
                        onChange={(e) =>
                          setProcessData({
                            isAnonymousAllowd: !processData.isAnonymousAllowd,
                          })
                        }
                        name="Check box to associate form with a workflow"
                        color="primary"
                      />
                    }
                    label="Annonymous"
                  />
                  {/* <span>Check box to associate form with a workflow</span> */}
                </label>
              </div>
              <label className="text-label">Status</label>
              <Select
                options={populateStatusDropdown()}
                onChange={(item) =>
                  setProcessData({
                    status: item[0].value,
                  })
                }
              />

              {/* <label>Comments</label> */}
              <label className="text-label">Comments</label>
              {/* <TextareaAutosize
                aria-label="minimum height"
                rowsMin={3}
                placeholder="Comments"
              /> */}
              <TextField
                id="comments"
                // label="Multiline"
                multiline
                rows={4}
                variant="outlined"
                className="text-field"
                value={processData.comments}
                onChange={(e) =>
                  setProcessData({
                    comments: e.target.value,
                  })
                }
              />
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
export default Preview;
