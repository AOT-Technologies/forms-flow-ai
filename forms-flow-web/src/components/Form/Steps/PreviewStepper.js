import React, { useState } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import { useSelector } from "react-redux";

import SaveNext from "./SaveNext";

const Preview = React.memo(
  ({
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
    // handleEditPreview,
    // disablePreview,
  }) => {
    const {t} = useTranslation();
    const [copied, setCopied] = useState(false);
    const processListData = useSelector((state)=>state.process.formProcessList)
    //  taking the url and make the copy button
    const copyPublicUrl = () => {
      const hostName = window.location.host;
      const url = `${hostName}/public/form/${formData.form._id}`;

      navigator.clipboard.writeText(url);
      setCopied(()=>{
        setTimeout(()=>{
          setCopied(false)
        },3000)
        return true
      });
    };

    return (
      <div>
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="baseline"
          spacing={3}
        >
          <Grid item xs={12} sm={1} spacing={3}>
            {/* <button
              className="MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary"
              onClick={handleEditPreview}
            >
              Edit
            </button> */}
          </Grid>
          <Grid item xs={12} sm={8} spacing={3} />
          <Grid item xs={12} sm={3} className="next-btn">
            <SaveNext
              handleBack={handleBack}
              handleNext={handleNext}
              activeStep={activeStep}
              steps={steps}
              submitData={submitData}
              isLastStep={true}
            />
          </Grid>
          <Grid item xs={12} sm={8} spacing={3} disabled={false}>
            <Card variant="outlined">
              <CardContent>
                <form noValidate autoComplete="off">
                  <div>
                    <span className="font-weight-bolder">{t("form_name")} : </span>
                    <span>
                      {formData && formData.form && formData.form.title
                        ? formData.form.title
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="font-weight-bolder">Workflow Name : </span>
                    <span>
                      {workflow && workflow.label ? workflow.label : "-"}
                    </span>
                  </div>
                  {processListData.anonymous && (
                    <div>
                      <span>Copy anonymous form URL</span>
                      <div
                        data-toggle="tooltip"
                        data-placement="top"
                        title={copied ? "URL copied" : "Click Here to Copy"}
                        className={`coursor-pointer btn ${copied?'text-success':'text-primary'}`}
                        onClick={() => {
                          copyPublicUrl();
                        }}
                      >
                        <i
                           class={`${copied?'fa fa-check':'fa fa-copy'}`}
                        ></i>
                      </div>
                    </div>
                  )}
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
                            checked={processData.status === "active"}
                            onChange={(e) =>
                              setProcessData({
                                status: e.target.checked
                                  ? "active"
                                  : "inactive",
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
                    value={processData.comments || ""}
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
      </div>
    );
  }
);
export default Preview;
