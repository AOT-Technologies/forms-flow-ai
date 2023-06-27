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
import { setUserGroups } from "../../../actions/authorizationActions";
import SaveNext from "./SaveNext";
import { copyText } from "../../../apiManager/services/formatterService";
import {
  addClients,
  getClientList,
  getUserRoles,
} from "../../../apiManager/services/authorizationService";
import {
  addUsers,
} from "../../../apiManager/services/authorizationService";
import LoadingOverlay from "react-loading-overlay";
import { Chip } from "@material-ui/core";
import { setFormDesignerPermissionRoles } from "../../../actions/formActions";


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
    const [designerSelectedOption, setDesignerSelectedOption] = useState("");
    const [clientSelectedOption, setClientSelectedOption] = useState("");
    const processListData = useSelector(
      (state) => state.process.formProcessList
    );
    const user =  useSelector(
      (state) => state.user.userDetail
    );
    const userGroups = useSelector(
      (state) => state.userAuthorization?.userGroups
    );
    const [designerOptions, setDesingerOptions] = useState([]);
    const [clientOptions, setClientOptions] = useState([]);
    const designerGroups = useSelector((state)=>state.process?.formDesignerPermissionRoles );
    const [clientGroups, setClientGroups] = useState([]);
    const [fetchClientLoading, setFetchClientLoading] = useState(false);
    const [anchorEl,setAnchorEl] = useState(null);
    const isDisabled =
      (designerSelectedOption == "Specific Designers" &&
        !designerGroups?.roles?.length) ||
      (clientSelectedOption == "Specific Clients" && !clientGroups.length);
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
    };

    useEffect(() => {
      getUserRoles()
        .then((res) => {
          dispatch(setUserGroups(res.data));
        })
        .catch((error) => console.error("error", error));
    }, []);

    useEffect(() => {
      setFetchClientLoading(true);
        setDesignerSelectedOption(
          designerGroups.roles?.length
            ? "Specific Designers"
            : designerGroups.userName
            ? "Private"
            : "All Designers"
        );
        setDesingerOptions(
          userGroups?.filter((i) => !designerGroups?.roles?.includes(i.name))
        );
      
        getClientList(processListData.parentFormId)
        .then((res) => {
          const resource = res.data;
          setClientGroups(resource?.roles || []);
          if (resource) {
            setClientSelectedOption(
              resource.roles?.length ? "Specific Clients" : "All Clients"
            );
          }
          setClientOptions(
            userGroups?.filter((i) => !resource?.roles?.includes(i.name))
          );
        })
        .catch((error) => console.error("error", error))
        .finally(()=> setFetchClientLoading(false));
    }, [userGroups]);

    const handleClick = (name) => (event)=> {
      setAnchorEl(event.currentTarget);
      setShow(name);
    };

    const addDesignerGroups = (data) => {
      dispatch(setFormDesignerPermissionRoles(
        {...designerGroups,roles:[...designerGroups.roles, data.name]}));
      setDesingerOptions(designerOptions?.filter((i) => i.name !== data.name));
      setShow(false);
    };

    const addClientGroups = (data) => {
      setClientGroups([...clientGroups, data.name]);
      setClientOptions(clientOptions?.filter((i) => i.name !== data.name));
      setShow(false);
    };

    const removeDesignerUserGroup = (group) => {
      const filteredRoles = designerGroups?.roles?.filter((item) => item !== group);
      dispatch( setFormDesignerPermissionRoles({...designerGroups,roles:filteredRoles}));
      const deletedValue = userGroups.find((i) => i.name == group);
      if(deletedValue){
      setDesingerOptions((prev) => [
        deletedValue,
        ...prev,
      ]);
      }
    };

    const removeClientUserGroup = (group) => {
      let newGroups = clientGroups?.filter((item) => item !== group);
      setClientGroups(newGroups);
      const deletedValue = userGroups.find((i) => i.name == group);
      if(deletedValue){
        setClientOptions((prev) => [
          deletedValue,
          ...prev,
        ]);
      }
      
    };

    const saveDesigner = () => {
      let payload = {
        resourceId: processListData.parentFormId,
        resourceDetails: {},
      };
      if (designerSelectedOption === "All Designers") {
        payload.roles = [];
      }
      if (designerSelectedOption === "Private") {
        payload.userName = user.preferred_username;
        payload.roles = [];
      }
      if (designerSelectedOption === "Specific Designers") {
        payload.roles = designerGroups.roles;
      }
      addUsers(payload).catch((error) => console.error("error", error));
    };

    const saveClients = () => {
      let payload = {
        resourceId: processListData.parentFormId,
        resourceDetails: {},
      };
      if (clientSelectedOption === "All Clients") {
        payload.roles = [];
      }

      if (clientSelectedOption === "Specific Clients") {
        payload.roles = clientGroups;
      }

      addClients(payload).catch((error) => console.error("error", error));
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
              isDisabled={isDisabled}
              submitData={() => {
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
                      {formData && formData?.form && formData?.form?.title
                        ? formData?.form?.title
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
                           <div>
                    <label>
                      <FormControlLabel
                      className="mr-1"
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
                      <label className="fontsize-16 ml-1">
                        {t("Publish this form for Client Users.")}
                      </label>
                    </label>
                  </div>
                  <hr />
 
                  <LoadingOverlay active={fetchClientLoading} spinner>
                      <div className="mt-2" style={{ height: "auto" }}>
                    <span
                      className="font-weight-bold"
                      title={t("Give Designer Role Permissions")}
                    >
                      Designer Permission
                      <i className="ml-1 fa fa-info-circle cursor-pointer text-primary" />
                    </span>

                    <div>
                      <label className="mr-4">
                        <input
                          className="mr-1"
                          type="radio"
                          value="All Designers"
                          checked={designerSelectedOption === "All Designers"}
                          onChange={(e) =>
                            setDesignerSelectedOption(e.target.value)
                          }
                        />
                        Accessible for all Designers
                      </label>
                      <label className="mr-4">
                        <input
                          className="mr-1"
                          type="radio"
                          value="Private"
                          checked={designerSelectedOption === "Private"}
                          onChange={(e) =>
                            setDesignerSelectedOption(e.target.value)
                          }
                        />
                        Private(Only You)
                      </label>
                      <label>
                        <input
                          className="mr-1"
                          type="radio"
                          value="Specific Designers"
                          checked={
                            designerSelectedOption === "Specific Designers"
                          }
                          onChange={(e) => {
                            setDesignerSelectedOption(e.target.value);
                          }}
                        />
                        Specific Designer Group
                      </label>
                    </div>
                    {designerSelectedOption === "Specific Designers" ? (
                      <div className="d-flex align-items-center flex-wrap">
                            {designerGroups?.roles?.map((e,) => 
                            <Chip key={e} label={e}
                             variant="outlined"
                             className="mr-2"  
                             onDelete={()=>{removeDesignerUserGroup(e);}}
                         />)}
                       
                      <Button
                          onClick={handleClick("designer")}
                          className="btn btn-primary btn-md form-btn pull-left btn-left"
                        >
                          <Translation>{(t) => t("Add")}</Translation> <b>+</b>
                        </Button>
                        <Popover
                          data-testid="popup-component"
                          id={id}
                          open={show === "designer"}
                          onClose={handleClose}
                          anchorEl={anchorEl} placement={"top"}
                        >
                          <ListGroup>
                            {designerOptions?.length > 0 ? (
                              designerOptions?.map((item, key) => (
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
                      
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                  <div>
                        <div>
                          <hr className="mt-1" />
                          <span className="font-weight-bold">
                            Client Permission
                          </span>
                          <div>
                            <label className="mr-4">
                              <input
                                className="mr-1"
                                type="radio"
                                value="All Clients"
                                checked={clientSelectedOption === "All Clients"}
                                onChange={(e) =>
                                  setClientSelectedOption(e.target.value)
                                }
                              />
                              All Clients
                            </label>
                            <label className="mr-4">
                              <input
                                className="mr-1"
                                type="radio"
                                value="Specific Clients"
                                checked={
                                  clientSelectedOption === "Specific Clients"
                                }
                                onChange={(e) => {
                                  setClientSelectedOption(e.target.value);
                                }}
                              />
                              Specific Client Group
                            </label>
                          </div>
                          {clientSelectedOption === "Specific Clients" ? (
                            <div className="d-flex align-items-center flex-wrap">
                            {clientGroups?.map((e,) => {
                                return (
                                <Chip key={e} label={e}
                                   variant="outlined"
                                   className="mr-2" 
                                   onDelete={()=>{removeClientUserGroup(e);}}
                               />
                                );
                              })}
                              <Button
                              onClick={handleClick("client")}
                                className="btn btn-primary btn-md form-btn pull-left btn-left"
                              >
                                <Translation>{(t) => t("Add")}</Translation>{" "}
                                <b>+</b>
                              </Button>
                              <Popover
                                data-testid="popup-component"
                                id={id}
                                open={show === "client"}
                                onClose={handleClose}
                                anchorEl={anchorEl} 
                                placement={"top"}
                              >
                                <ListGroup>
                                  {clientOptions?.length > 0 ? (
                                    clientOptions?.map((item, key) => (
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
                          
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                  </div>
                  </LoadingOverlay>
                  <hr />
         
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
