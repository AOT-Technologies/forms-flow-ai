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
                    <span className="fw-bold">{t("Overview")}</span>
                    <hr />
                  </div>
                  <div>
                  <div className="d-flex flex-column flex-md-row px-3">
                    <div className="fw-bold col-md-2 col-12">
                      {t("Form Name")} :{" "}
                    </div>
                    <span className="col-md-8 col-12">
                      {formData && formData?.form && formData?.form?.title
                        ? formData?.form?.title
                        : "-"}
                     </span>
                  </div>
                  <div className="d-flex flex-column flex-md-row my-2 px-3">
                  <div className="fw-bold col-md-2 col-12">
                      {t("Workflow Name")} :{" "}
                    </div>
                    <span className="col-md-8 col-12">
                      {workflow && workflow.label ? workflow.label : "-"}
                    </span>
                  </div>
                  </div>
                  {processListData.anonymous && (
                    <div className="d-flex align-items-md-center px-3 my-2">
                      <div className="fw-bold">
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
                      <div className="d-flex align-items-center me-4 form-check form-switch ps-0 gap-5">
                          <label className=" me-2 fw-bold">{t("Publish this form for Client Users.")}</label>
                          <input 
                          checked={processData.status === "active"}
                          className="form-check-input mb-1" 
                          type="checkbox" 
                          role="switch" 
                          id="form-publish"
                          color="primary"
                          onChange={(e) =>
                            setProcessData({
                              status: e.target.checked
                                ? "active"
                                : "inactive",
                            })
                          } 
                          name="Check box to associate form with a workflow"
                          data-testid="form-publish-switch"
                          ></input>
                        </div>
                        
                      </Form.Group>
                    </label>
                  </div>
                  <hr />
                  <div className="mt-2 h-auto">
                    <span
                      className="fw-bold"
                      title={t("Applicable for Designer Roled Users only.")}
                    >
                      {t("Design Permission")}
                      <i className="ms-1 fa fa-info-circle cursor-pointer text-primary" />
                    </span>

                    <div>
                      <label className="me-4">
                        <input
                          className="me-1"
                          type="radio"
                          value="All Designers"
                          checked={designerSelectedOption === "All Designers"}
                          onChange={(e) =>
                            setDesignerSelectedOption(e.target.value)
                          }
                          data-testid="form-design-permission-all-designers"
                        />
                        {t("All Designers")}
                      </label>
                      <label className="me-4">
                        <input
                          className="me-1"
                          type="radio"
                          value="Private"
                          checked={designerSelectedOption === "Private"}
                          onChange={(e) =>
                            setDesignerSelectedOption(e.target.value)
                          }
                          data-testid="form-design-permission-private"
                        />
                        {t("Private(only you)")}
                      </label>
                      <label>
                        <input
                          className="me-1"
                          type="radio"
                          value="Specific Designers"
                          checked={
                            designerSelectedOption === "Specific Designers"
                          }
                          onChange={(e) => {
                            setDesignerSelectedOption(e.target.value);
                          }}
                          data-testid="form-design-permission-specific-designers"
                        />
                        {t("Specific Designer Group")}
                      </label>
                    </div>
                    {designerSelectedOption === "Specific Designers" ? (
                      <div className="d-flex align-items-center flex-wrap">
                        {designerGroups?.map((e) => (
                          <Badge key={e} pill variant="outlined" className="d-flex align-items-center badge me-2 mt-2">
                            {e}
                            <div
                              data-testid={`form-designer-delete-icon-${e}`}
                              className="badge-deleteIcon ms-2"
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
                                        data-testid={`form-specific-designer-option-${key}`}
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
                      <Button id="addDesigner" className="btn btn-primary  btn-small mt-2" data-testid="form-designer-group-add-button">
                          <i className="fa-solid fa-plus me-2"></i>
                            <Translation>{(t) => t("Add")}</Translation>
                          </Button>
                        </OverlayTrigger>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                  <div>
                    <div>
                      <hr className="mt-3" />
                      <span
                        className="fw-bold"
                        title={t(
                          "Applicable for Client and Reviewer Roled Users only."
                        )}
                      >
                        {t("Permission to create new submission")}
                        <i className="ms-1 fa fa-info-circle cursor-pointer text-primary" />
                      </span>
                      <div>
                        <label className="me-4">
                          <input
                            className="me-1"
                            type="radio"
                            value="All Users"
                            checked={clientSelectedOption === "All Users"}
                            onChange={(e) =>
                              setClientSelectedOption(e.target.value)
                            }
                            data-testid="form-create-submission-permission-all-users"
                          />
                          {t("All Users")}
                        </label>
                        <label className="me-4">
                          <input
                            className="me-1"
                            type="radio"
                            value="Specific Users"
                            checked={clientSelectedOption === "Specific Users"}
                            onChange={(e) => {
                              setClientSelectedOption(e.target.value);
                            }}
                            data-testid="form-create-submission-permission-specific-users"
                          />
                          {t("Specific User Group")}
                        </label>
                      </div>
                      {clientSelectedOption === "Specific Users" ? (
                        <div className="d-flex align-items-center flex-wrap">
                          {clientGroups?.map((e) => {
                            return (
                              <Badge key={e} pill variant="outlined" className="d-flex align-items-center badge me-2 mt-2">
                                {e}
                                <div
                                  data-testid={`form-user-delete-icon-${e}`}
                                  className="badge-deleteIcon ms-2"
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
                                          data-testid={`specific-user-option-${key}`}
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
                        <Button
                          data-testid="form-user-group-add-button"
                          id="addClient"
                          className="btn btn-primary btn-small mt-2">
                            <i className="fa-solid fa-plus me-2"></i>
                              <Translation>{(t) => t("Add")}</Translation>
                            </Button>
                          </OverlayTrigger>
                        </div>
                      ) : (
                        ""
                      )}
                    </div>

                    <div>
                      <div>
                        <hr className="mt-3" />
                        <span
                          className="fw-bold"
                          title={t("Permission for submission tracking.")}
                        >
                          {t("Reviewer permission to view submissions")}
                          <i className="ms-1 fa fa-info-circle cursor-pointer text-primary" />
                        </span>
                        <div>
                          <label className="me-4">
                            <input
                              className="me-1"
                              type="radio"
                              value="All Reviewers"
                              checked={
                                reviewerSelectedOption === "All Reviewers"
                              }
                              onChange={(e) =>
                                setReviewerSelectedOption(e.target.value)
                              }
                              data-testid="form-view-submission-permission-all-reviewers"
                            />
                            {t("All Reviewers")}
                          </label>
                          <label className="me-4">
                            <input
                              className="me-1"
                              type="radio"
                              value="Specific Reviewers"
                              checked={
                                reviewerSelectedOption === "Specific Reviewers"
                              }
                              onChange={(e) => {
                                setReviewerSelectedOption(e.target.value);
                              }}
                              data-testid="form-view-submission-permission-specific-reviewers"
                            />
                            {t("Specific Reviewers")}
                          </label>
                        </div>
                        {reviewerSelectedOption === "Specific Reviewers" ? (
                          <div className="d-flex align-items-center flex-wrap">
                            {reviewerGroups?.map((e) => {
                              return (
                                <Badge key={e} pill variant="outlined" className="d-flex align-items-center badge me-2 mt-2">
                                  {e}
                                  <div
                                    data-testid={`form-reviewer-delete-icon-${e}`}
                                    className="badge-deleteIcon ms-2"
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
                                            data-testid={`form-specific-reviewer-option-${key}`}
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
                          <Button data-testid="form-reviewer-group-add-button"
                            id="addReviewer"
                            className="btn btn-primary btn-small mt-2">
                              <i className="fa-solid fa-plus me-2"></i>
                                <Translation>{(t) => t("Add")}</Translation>
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
                    data-testid="form-comments"
                  />
                 
              </Card.Body>
            </Card>
        
        </div>
      </div>
    );
  }
);
export default Preview;
