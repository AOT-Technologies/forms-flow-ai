import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { Form } from 'react-bootstrap';
import ListGroup from "react-bootstrap/ListGroup";
import { Button } from "react-bootstrap"; 
import { Card } from 'react-bootstrap';
import { useTranslation, Translation } from "react-i18next";
import { setUserGroups } from "../../../actions/authorizationActions";
import SaveNext from "./SaveNext";
import { copyText } from "../../../apiManager/services/formatterService";
import {
  handleAuthorization,
  getUserRoles,
} from "../../../apiManager/services/authorizationService";
import { Badge } from 'react-bootstrap';
import "../Steps/steps.scss";

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
    const [designerSelectedOption, setDesignerSelectedOption] = useState("");
    const [clientSelectedOption, setClientSelectedOption] = useState("");
    const [reviewerSelectedOption, setReviewerSelectedOption] = useState("");
    const processListData = useSelector(
      (state) => state.process.formProcessList
    );
    const user = useSelector((state) => state.user.userDetail);
    const userGroups = useSelector(
      (state) => state.userAuthorization?.userGroups
    );
    const authorizationDetails = useSelector(
      (state) => state.process?.authorizationDetails
    );
    const [designerOptions, setDesingerOptions] = useState([]);
    const [clientOptions, setClientOptions] = useState([]);
    const [reviewerOptions, setReviewerOptions] = useState([]);

    const [clientGroups, setClientGroups] = useState([]);
    const [reviewerGroups, setReviewerGroups] = useState([]);
    const [designerGroups, setDesignerGroups] = useState([]);
    const isDisabled =
      (designerSelectedOption == "Specific Designers" &&
        !designerGroups?.length) ||
      (clientSelectedOption == "Specific Users" && !clientGroups.length) ||
      (reviewerSelectedOption == "Specific Reviewers" &&
        !reviewerGroups.length);
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
    useEffect(() => {
      getUserRoles()
        .then((res) => {
          dispatch(setUserGroups(res.data));
        })
        .catch((error) => console.error("error", error));
    }, []);

    useEffect(() => {
      const { DESIGNER, APPLICATION, FORM } = authorizationDetails;
      setDesignerGroups(DESIGNER?.roles || []);
      setReviewerGroups(APPLICATION?.roles || []);
      setClientGroups(FORM?.roles || []);
      setDesignerSelectedOption(
        DESIGNER?.roles?.length
          ? "Specific Designers"
          : DESIGNER?.userName
            ? "Private"
            : "All Designers"
      );
      setClientSelectedOption(
        FORM?.roles?.length ? "Specific Users" : "All Users"
      );
      setReviewerSelectedOption(
        APPLICATION?.roles?.length ? "Specific Reviewers" : "All Reviewers"
      );

      setDesingerOptions(
        userGroups?.filter((i) => !DESIGNER?.roles?.includes(i.name))
      );
      setClientOptions(
        userGroups?.filter((i) => !FORM?.roles?.includes(i.name))
      );
      setReviewerOptions(
        userGroups?.filter((i) => !APPLICATION?.roles?.includes(i.name))
      );
    }, [userGroups]);

    const addDesignerGroups = (data) => {
      setDesignerGroups([...designerGroups, data.name]);
      setDesingerOptions(designerOptions?.filter((i) => i.name !== data.name));
      let button = document.getElementById("addDesigner");
      button.click();
    };

    const addClientGroups = (data) => {
      setClientGroups([...clientGroups, data.name]);
      setClientOptions(clientOptions?.filter((i) => i.name !== data.name));
      let button = document.getElementById("addClient");
      button.click();
    };

    const addReviewerGroups = (data) => {
      setReviewerGroups([...reviewerGroups, data.name]);
      setReviewerOptions(reviewerOptions?.filter((i) => i.name !== data.name));
      let button = document.getElementById("addReviewer");
      button.click();
    };

    const removeDesignerUserGroup = (group) => {
      const filteredRoles = designerGroups?.filter((item) => item !== group);
      setDesignerGroups(filteredRoles);
      const deletedValue = userGroups.find((i) => i.name == group);
      if (deletedValue) {
        setDesingerOptions((prev) => [deletedValue, ...prev]);
      }
    };

    const removeClientUserGroup = (group) => {
      let newGroups = clientGroups?.filter((item) => item !== group);
      setClientGroups(newGroups);
      const deletedValue = userGroups.find((i) => i.name == group);
      if (deletedValue) {
        setClientOptions((prev) => [deletedValue, ...prev]);
      }
    };

    const removeReviewerUserGroup = (group) => {
      let newReviewers = reviewerGroups?.filter((item) => item !== group);
      setReviewerGroups(newReviewers);
      const deletedValue = userGroups.find((i) => i.name == group);
      if (deletedValue) {
        setReviewerOptions((prev) => [deletedValue, ...prev]);
      }
    };

    const getDesignerPayload = () => {
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
        payload.roles = designerGroups;
      }
      return payload;
    };

    const getSubmissionPayload = () => {
      let payload = {
        resourceId: processListData.parentFormId,
        resourceDetails: {},
      };
      if (clientSelectedOption === "All Users") {
        payload.roles = [];
      }

      if (clientSelectedOption === "Specific Users") {
        payload.roles = clientGroups;
      }
      return payload;
    };

    const getReviewerPayload = () => {
      let payload = {
        resourceId: processListData.parentFormId,
        resourceDetails: {},
      };
      if (reviewerSelectedOption === "All Reviewers") {
        payload.roles = [];
      }

      if (reviewerSelectedOption === "Specific Reviewers") {
        payload.roles = reviewerGroups;
      }
      return payload;
    };

    const saveAuthorization = () => {
      const data = {};
      data.application = getReviewerPayload();
      data.designer = getDesignerPayload();
      data.form = getSubmissionPayload();
      handleAuthorization(data, processListData.parentFormId).catch((err) => {
        console.log(err);
      });
    };

    return (
      <div className="m-3">
        <div className="d-flex justify-content-md-end align-items-center">
        <SaveNext
              handleBack={handleBack}
              handleNext={handleNext}
              activeStep={activeStep}
              steps={steps}
              isDisabled={isDisabled}
              submitData={() => {
                submitData();
                saveAuthorization();
              }}
              isLastStep={true}
            />
        </div>
        <div className="mt-3">

 
          
            <Card>
              <Card.Body>
                
                  <div>
                    <span className="font-weight-bold">{t("Overview")}</span>
                    <hr />
                  </div>
                  <div>
                  <div className="d-flex flex-column flex-md-row">
                    <div className="font-weight-bold col-md-2 col-12">
                      {t("Form Name")} :{" "}
                    </div>
                    <span className="col-md-8 col-12">
                      {formData && formData?.form && formData?.form?.title
                        ? formData?.form?.title
                        : "-"}
                    </span>
                  </div>
                  <div className="d-flex flex-column flex-md-row my-2">
                  <div className="font-weight-bold col-md-2 col-12">
                      {t("Workflow Name")} :{" "}
                    </div>
                    <span className="col-md-8 col-12">
                      {workflow && workflow.label ? workflow.label : "-"}
                    </span>
                  </div>
                  </div>
                  {processListData.anonymous && (
                    <div className="d-flex align-items-md-center px-3 my-2">
                      <div className="font-weight-bold">
                        {t("Copy anonymous form URL")}
                      </div>
                      <div
                        data-toggle="tooltip"
                        data-placement="top"
                        title={
                          copied ? t("URL copied") : t("Click Here to Copy")
                        }
                        className={`coursor-pointer btn ${copied ? "text-success" : "text-primary"
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
                  <div className="px-3 my-2">
                    <label>
                      <Form.Group controlId="publishForm" className="mb-0">
                      <div className="d-flex align-items-center mr-4">
                          <label className=" mr-2 font-weight-bold">{t("Publish this form for Client Users.")}</label>
                          <Form.Check
                            checked={processData.status === "active"}
                            type="switch"
                            color="primary" 
                            onChange={(e) =>
                              setProcessData({
                                status: e.target.checked
                                  ? "active"
                                  : "inactive",
                              })
                            }
                            custom
                            name="Check box to associate form with a workflow"
                          
                            id="form-publish"
                          />
                        </div>
                        
                      </Form.Group>
                    </label>
                  </div>
                  <hr />
                  <div className="mt-2" style={{ height: "auto" }}>
                    <span
                      className="font-weight-bold"
                      title={t("Applicable for Designer Roled Users only.")}
                    >
                      {t("Design Permission")}
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
                        {t("All Designers")}
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
                        {t("Private(only you)")}
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
                        {t("Specific Designer Group")}
                      </label>
                    </div>
                    {designerSelectedOption === "Specific Designers" ? (
                      <div className="d-flex align-items-center flex-wrap">
                        {designerGroups?.map((e) => (
                          <Badge key={e} pill variant="outlined" className="d-flex align-items-center badge mr-2">
                            {e}
                            <div className="badge-deleteIcon ml-2"
                              onClick={() => { removeDesignerUserGroup(e); }}>
                              &times;
                            </div>
                          </Badge>
                        ))}
                        <OverlayTrigger
                          placement="right"
                          trigger="click"
                          rootClose={true}
                          overlay={(
                            <Popover>
                              <div className="poper">
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
                              </div>

                            </Popover>
                          )}
                        >
                          <Button id="addDesigner" className="btn btn-primary btn-md form-btn pull-left btn-left">
                            <Translation>{(t) => t("Add")}</Translation> <b>+</b>
                          </Button>
                        </OverlayTrigger>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                  <div>
                    <div>
                      <hr className="mt-1" />
                      <span
                        className="font-weight-bold"
                        title={t(
                          "Applicable for Client and Reviewer Roled Users only."
                        )}
                      >
                        {t("Permission to create new submission")}
                        <i className="ml-1 fa fa-info-circle cursor-pointer text-primary" />
                      </span>
                      <div>
                        <label className="mr-4">
                          <input
                            className="mr-1"
                            type="radio"
                            value="All Users"
                            checked={clientSelectedOption === "All Users"}
                            onChange={(e) =>
                              setClientSelectedOption(e.target.value)
                            }
                          />
                          {t("All Users")}
                        </label>
                        <label className="mr-4">
                          <input
                            className="mr-1"
                            type="radio"
                            value="Specific Users"
                            checked={clientSelectedOption === "Specific Users"}
                            onChange={(e) => {
                              setClientSelectedOption(e.target.value);
                            }}
                          />
                          {t("Specific User Group")}
                        </label>
                      </div>
                      {clientSelectedOption === "Specific Users" ? (
                        <div className="d-flex align-items-center flex-wrap">
                          {clientGroups?.map((e) => {
                            return (
                              <Badge key={e} pill variant="outlined" className="d-flex align-items-center badge mr-2">
                                {e}
                                <div className="badge-deleteIcon ml-2"
                                  onClick={() => { removeClientUserGroup(e); }}>
                                  &times;
                                </div>
                              </Badge>
                            );
                          })}
                          <OverlayTrigger
                            placement="right"
                            trigger="click"
                            overlay={(
                              <Popover>
                                <div className="poper">
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
                                </div>

                              </Popover>
                            )}
                          >
                            <Button id="addClient" className="btn btn-primary btn-md form-btn pull-left btn-left">
                              <Translation>{(t) => t("Add")}</Translation> <b>+</b>
                            </Button>
                          </OverlayTrigger>
                        </div>
                      ) : (
                        ""
                      )}
                    </div>

                    <div>
                      <div>
                        <hr className="mt-1" />
                        <span
                          className="font-weight-bold"
                          title={t("Permission for submission tracking.")}
                        >
                          {t("Reviewer permission to view submissions")}
                          <i className="ml-1 fa fa-info-circle cursor-pointer text-primary" />
                        </span>
                        <div>
                          <label className="mr-4">
                            <input
                              className="mr-1"
                              type="radio"
                              value="All Reviewers"
                              checked={
                                reviewerSelectedOption === "All Reviewers"
                              }
                              onChange={(e) =>
                                setReviewerSelectedOption(e.target.value)
                              }
                            />
                            {t("All Reviewers")}
                          </label>
                          <label className="mr-4">
                            <input
                              className="mr-1"
                              type="radio"
                              value="Specific Reviewers"
                              checked={
                                reviewerSelectedOption === "Specific Reviewers"
                              }
                              onChange={(e) => {
                                setReviewerSelectedOption(e.target.value);
                              }}
                            />
                            {t("Specific Reviewers")}
                          </label>
                        </div>
                        {reviewerSelectedOption === "Specific Reviewers" ? (
                          <div className="d-flex align-items-center flex-wrap">
                            {reviewerGroups?.map((e) => {
                              return (
                                <Badge key={e} pill variant="outlined" className="d-flex align-items-center badge mr-2">
                                  {e}
                                  <div className="badge-deleteIcon ml-2"
                                    onClick={() => { removeReviewerUserGroup(e); }}>
                                    &times;
                                  </div>
                                </Badge>
                              );
                            })}

                            <OverlayTrigger
                              placement="right"
                              trigger="click"
                              overlay={(
                                <Popover>
                                  <div className="poper">
                                    <ListGroup>
                                      {reviewerOptions?.length > 0 ? (
                                        reviewerOptions?.map((item, key) => (
                                          <ListGroup.Item
                                            key={key}
                                            as="button"
                                            onClick={() => addReviewerGroups(item)}
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
                                  </div>

                                </Popover>
                              )}
                            >
                              <Button id="addReviewer" className="btn btn-primary btn-md form-btn pull-left btn-left">
                                <Translation>{(t) => t("Add")}</Translation> <b>+</b>
                              </Button>
                            </OverlayTrigger>
                          </div>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  </div>

                  <hr />

                  <label htmlFor="comments" className="text-label">{t("Comments")}</label>
                  <textarea
                    label={t("Comments")}
                    id="comments"
                    rows={4}
                    className="form-control"
                    value={processData.comments || ""}
                    onChange={(e) =>
                      setProcessData({
                        comments: e.target.value,
                      })
                    }
                  />
                 
              </Card.Body>
            </Card>
        
        </div>
      </div>
    );
  }
);
export default Preview;
