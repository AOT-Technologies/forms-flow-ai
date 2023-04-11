import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Popover from "@material-ui/core/Popover";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import ListGroup from "react-bootstrap/ListGroup";
import { Button } from "react-bootstrap";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import { useTranslation, Translation } from "react-i18next";
import SaveNext from "./SaveNext";
import { copyText } from "../../../apiManager/services/formatterService";
import { setClientGroups, setDesignerGroups,setUserGroups } from "../../../actions/authorizationActions";
import { addClients, getClientList, getUserRoles } from "../../../apiManager/services/authorizationService";
import { addUsers, fetchUsers } from "../../../apiManager/services/authorizationService";

const Preview = React.memo(
  ({
    handleNext,
    handleBack,
    activeStep,
    steps,
    processData,
    setProcessData,
    workflow,
    formData,
    submitData,
  }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);
    const [show, setShow] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [designerSelectedOption, setDesignerSelectedOption] = useState("");
    const [clientSelectedOption,setClientSelectedOption] = useState("");
    const processListData = useSelector((state) => state.process.formProcessList);
    const userGroups = useSelector((state) => state.userAuthorization?.userGroups);
    const designerGroups = useSelector((state)=> state.userAuthorization?.designerGroups);
    const clientGroups = useSelector((state)=> state.userAuthorization?.clientGroups);
    const id = show ? "simple-popover" : undefined;
    const copyPublicUrl = () => {
      const originUrl = window.origin;
      const url = `${originUrl}/public/form/${formData.form.path}`;
      copyText(url)
        .then(() => {
          setCopied(() => {
            setTimeout(() => {
              setCopied(false);
            }, 3000);
            return true;
          });
        })
        .catch((err) => {
          console.error(err);
        });
    };
    
    const handleClose = () => {
      setShow(false);
      setAnchorEl(null);
    };

   useEffect(()=>{
    getUserRoles()
    .then((res) => {
      dispatch(setUserGroups(res.data));
    })
    .catch((error) => console.error("error", error));
   },[]);

    useEffect(()=>{
      fetchUsers().then((res)=>{
        res?.data.map((e)=>{
          if(e.resourceId === processListData.formId){
            dispatch(setDesignerGroups(e.roles));
          }
        });
      }).catch((error)=> console.error("error",error));

      getClientList().then((res)=>{
        res?.data.map((e)=>{
          if(e.resourceId === processListData.formId){
            dispatch(setClientGroups(e.roles));
          }
        });
      }).catch((error)=> console.error("error",error));
    },[]);

    const handleClick = (event) => {
      setShow(!show);
      setAnchorEl(event.currentTarget);
    };

    const addDesignerGroups = (data) => {
      dispatch(setDesignerGroups([...designerGroups, data.name]));
      setShow(!show);
    };
    const addClientGroups = (data) => {
      dispatch(setClientGroups([...clientGroups, data.name]));
      setShow(!show);
    };

    const removeDesignerUserGroup = (group) => {
      let newGroups = designerGroups?.filter((item) => item !== group);
      dispatch(setDesignerGroups(newGroups));
    };

    const removeClientUserGroup = (group) => {
      let newGroups = clientGroups?.filter((item) => item !== group);
      dispatch(setClientGroups(newGroups));
    };

    const saveDesigner = ()=>{
      let payload;
      if(designerSelectedOption === 'All Designers'){
        payload = {
          resourceId : processListData.formId,
          resourceDetails:{},
          roles:[]
        };
        addUsers(payload).catch((error)=> console.error("error",error));
      }
      if(designerSelectedOption === 'Private'){
        payload = {
          resourceId : processListData.formId,
          resourceDetails:{},
          userName: processListData.createdBy
        };
        addUsers(payload).catch((error)=> console.error("error",error));
      }
      if(designerSelectedOption === 'Specific Designers'){
        payload = {
          resourceId : processListData.formId,
          resourceDetails:{},
          roles:designerGroups
        };
        addUsers(payload).catch((error)=> console.error("error",error));
      }
    };

    const saveClients = ()=>{
      let payload = {
        resourceId : processListData.formId,
        resourceDetails:{},
        roles:clientGroups
      };
      if(clientSelectedOption === 'All Clients'){
        payload = {
          resourceId : processListData.formId,
          resourceDetails:{},
          roles:[]
        };
        addClients(payload).catch((error)=> console.error("error",error));
      }
      if(clientSelectedOption === 'Specific Clients'){
        payload = {
          resourceId : processListData.formId,
          resourceDetails:{},
          roles:clientGroups
        };
        addClients(payload).catch((error)=> console.error("error",error));
      }
      
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
          <Grid item xs={12} sm={1} spacing={3}></Grid>
          <Grid item xs={12} sm={8} spacing={3} />
          <Grid item xs={12} sm={3} className="next-btn">
            <SaveNext
              handleBack={handleBack}
              handleNext={handleNext}
              activeStep={activeStep}
              steps={steps}
              submitData={()=>{
                submitData(); 
                saveDesigner();
                saveClients();
              }}
              isLastStep={true}

            />
          </Grid>
          <Grid item xs={12} sm={8} spacing={3} disabled={false}>
            <Card variant="outlined">
              <CardContent>
                <form noValidate autoComplete="off">
                  <div>
                    <span className="font-weight-bold">Overview</span>
                    <hr />
                  </div>
                  <div>
                    <span className="font-weight-bolder">
                      {t("Form Name")} :{" "}
                    </span>
                    <span>
                      {formData && formData.form && formData.form.title
                        ? formData.form.title
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="font-weight-bolder">
                      {t("Workflow Name")} :{" "}
                    </span>
                    <span>
                      {workflow && workflow.label ? workflow.label : "-"}
                    </span>
                  </div>
                  {processListData.anonymous && (
                    <div>
                      <span className="fontsize-16">
                        {t("Copy anonymous form URL")}
                      </span>
                      <div
                        data-toggle="tooltip"
                        data-placement="top"
                        title={
                          copied ? t("URL copied") : t("Click Here to Copy")
                        }
                        className={`coursor-pointer btn ${
                          copied ? "text-success" : "text-primary"
                        }`}
                        onClick={() => {
                          copyPublicUrl();
                        }}
                      >
                        <i
                          className={`${copied ? "fa fa-check" : "fa fa-copy"}`}
                        />
                      </div>
                    </div>
                  )}
                  <hr />
                  <div className="mt-2" style={{height:'auto'}}>
                    <span className="font-weight-bold" title={t("Give Designer Role Permissions")}>
                       Designer Permission
                       
                      <i className="ml-1 fa fa-info-circle cursor-pointer"/>
                    </span>
                    
                    <div>
                      <label className="mr-4">
                        <input
                          className="mr-1"
                          type="radio"
                          value="All Designers"
                          checked={designerSelectedOption === "All Designers"}
                          onChange={(e) => setDesignerSelectedOption(e.target.value)}
                        />
                        Accessible for all Designers
                      </label>
                      <label className="mr-4">
                        <input
                          className="mr-1"
                          type="radio"
                          value="Private"
                          checked={designerSelectedOption === "Private"}
                          onChange={(e) => setDesignerSelectedOption(e.target.value)}
                        />
                        Private(Only You)
                      </label>
                      <label>
                        <input
                          className="mr-1"
                          type="radio"
                          value="Specific Designers"
                          checked={designerSelectedOption === "Specific Designers"}
                          onChange={(e) => setDesignerSelectedOption(e.target.value)}
                        />
                        Specific Designer Group
                      </label>
                    </div>
                    {designerSelectedOption === "Specific Designers" ? (
                      <div className="form-group d-flex flex-wrap">
                        <Button
                          onClick={(e) => handleClick(e)}
                          className="btn btn-primary btn-md form-btn pull-left btn-left"
                        >
                          <Translation>{(t) => t("Add")}</Translation> <b>+</b>
                        </Button>
                        <Popover
                          data-testid="popup-component"
                          id={id}
                          open={show}
                          anchorEl={anchorEl}
                          onClose={handleClose}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "center",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "center",
                          }}
                        >
                          <ListGroup>
                            {userGroups?.length > 0 ? (
                              userGroups?.map((item, key) => (
                                <ListGroup.Item
                                  key={key}
                                  as="button"
                                  onClick={() => addDesignerGroups(item)}
                                >
                                  {item.name}
                                </ListGroup.Item>
                              ))
                            ) : (
                              <ListGroup.Item>{`${t(
                                "All groups have access to the form"
                              )}`}</ListGroup.Item>
                            )}
                          </ListGroup>
                        </Popover>
                        {designerGroups?.map((e, index) => {
                          return (
                            <div key={index} className="flex-wrap mt-2">
                              <div className="chip-element mr-2">
                                <span className="chip-label">
                                  {e}:{""}
                                  <span
                                    className="chip-close"
                                    onClick={() => removeDesignerUserGroup(e)}
                                  >
                                    <i className="fa fa-close"></i>
                                  </span>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                  <hr className="mt-3"/>
                  <div className="mt-5">
                    <span className="font-weight-bold">Client Permission</span>
                   
                    <div>
                      <label className="mr-4">
                        <input
                          className="mr-1"
                          type="radio"
                          value="All Clients"
                          checked={clientSelectedOption === "All Clients"}
                          onChange={(e) => setClientSelectedOption(e.target.value)}
                        />
                        All Clients
                      </label>
                      <label className="mr-4">
                        <input
                          className="mr-1"
                          type="radio"
                          value="Specific Clients"
                          checked={clientSelectedOption === "Specific Clients"}
                          onChange={(e) => setClientSelectedOption(e.target.value)}
                        />
                        Specific Client Group
                      </label>
                    </div>
                    {clientSelectedOption === "Specific Clients" ? (
                      <div className="form-group d-flex flex-wrap">
                        <Button
                          //data-testid={rowIdx}
                          onClick={(e) => handleClick(e)}
                          className="btn btn-primary btn-md form-btn pull-left btn-left"
                          //disabled={!isGroupUpdated}
                        >
                          <Translation>{(t) => t("Add")}</Translation> <b>+</b>
                        </Button>
                        <Popover
                          data-testid="popup-component"
                          id={id}
                          open={show}
                          anchorEl={anchorEl}
                          onClose={handleClose}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "center",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "center",
                          }}
                        >
                          <ListGroup>
                            {userGroups?.length > 0 ? (
                              userGroups?.map((item, key) => (
                                <ListGroup.Item
                                  key={key}
                                  as="button"
                                  onClick={() => addClientGroups(item)}
                                >
                                  {item.name}
                                </ListGroup.Item>
                              ))
                            ) : (
                              <ListGroup.Item>{`${t(
                                "All groups have access to the form"
                              )}`}</ListGroup.Item>
                            )}
                          </ListGroup>
                        </Popover>
                        {clientGroups?.map((e, index) => {
                          return (
                            <div key={index} className="flex-wrap mt-2">
                              <div className="chip-element mr-2">
                                <span className="chip-label">
                                  {e}:{""}
                                  <span
                                    className="chip-close"
                                    // data-testid={rowData.resourceDetails.name + label}
                                    onClick={() => removeClientUserGroup(e)}
                                  >
                                    <i className="fa fa-close"></i>
                                  </span>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                  <hr />
                  <div>
                    <label>
                      <FormControlLabel
                        control={
                          <Checkbox
                            aria-label="Publish"
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
                      />
                      <label className="fontsize-16">
                        {t("Publish this form for Client Users.")}
                      </label>
                    </label>
                  </div>
                  <label className="text-label">{t("Comments")}</label>
                  <TextField
                    label={t("Comments")}
                    id="comments"
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