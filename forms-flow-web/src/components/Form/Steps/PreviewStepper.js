import React from "react";
import {
  Checkbox,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  TextField,
} from "@material-ui/core";
import SaveNext from "./SaveNext";

const Preview = (props) => {
  const {
    handleNext,
    handleBack,
    activeStep,
    steps,
    processData,
    // handleAnonymous,
    setProcessData,
    workflow,
    formData,
    submitData,
  } = props;

  return (
    <Grid
      container
      direction="row"
      justify="flex-start"
      alignItems="baseline"
      spacing={3}
    >
      <Grid item xs={9} spacing={3}/>
      <Grid item xs={3} className="next-btn">
        <SaveNext
          handleBack={handleBack}
          handleNext={handleNext}
          activeStep={activeStep}
          steps={steps}
          submitData={submitData}
          isLastStep={true}
        />
      </Grid>
      <Grid item sm={8} xs={12} spacing={3}>
        <Card variant="outlined">
          <CardContent>
            <form noValidate autoComplete="off">
              <div>
                <span className="font-weight-bolder">Form Name : </span>
                <span>{formData &&
                formData.form &&
                formData.form.title ? formData.form.title : "-"}</span>
              </div>
              <div>
                <span className="font-weight-bolder">Workflow Name : </span>
                <span>{workflow &&
                workflow.label ? workflow.label : "-"}</span>
              </div>
              {/*<div>
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
                    label="Anonymous"
                  />
                   <span>Check box to associate form with a workflow</span>
                </label>
              </div>*/}
              <div>
                <label>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={processData.status === 'active'}
                        onChange={(e) =>
                          setProcessData({
                            status: e.target.checked?'active':"inactive",
                          })
                        }
                        name="Check box to associate form with a workflow"
                        color="primary"
                      />
                    }
                    label="Publish this form for Client Users."
                  />
                </label>
              </div>
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
