import React, { useEffect, useState } from "react";
import { Row, Col, Tooltip, OverlayTrigger } from "react-bootstrap";
import {
  getISODateTime,
  getFormattedDateAndTime,
  getProcessDataObjectFromList,
} from "../../../apiManager/services/formatterService";
import { useDispatch, useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import "./../ServiceFlow.scss";
import AddGroupModal from "./AddGroupModal";
import {
  claimBPMTask,
  fetchServiceTaskList,
  getBPMTaskDetail,
  unClaimBPMTask,
  updateAssigneeBPMTask,
  updateBPMTask,
} from "../../../apiManager/services/bpmTaskServices";
import { setBPMTaskDetailUpdating } from "../../../actions/bpmTaskActions";
import UserSelectionDebounce from "./UserSelectionDebounce";
import SocketIOService from "../../../services/SocketIOService";
import { useTranslation } from "react-i18next";

const TaskHeader = React.memo(() => {
  const task = useSelector((state) => state.bpmTasks.taskDetail);
  const taskId = useSelector((state) => state.bpmTasks.taskId);
  const processList = useSelector((state) => state.bpmTasks.processList);
  const username = useSelector(
    (state) => state.user?.userDetail?.preferred_username || ""
  );
  const taskGroups = useSelector((state) => state.bpmTasks.taskGroups);
  const selectedFilter = useSelector((state) => state.bpmTasks.selectedFilter);
  const reqData = useSelector((state) => state.bpmTasks.listReqParams);
  const firstResult = useSelector((state) => state.bpmTasks.firstResult);
  const [followUpDate, setFollowUpDate] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [showModal, setModal] = useState(false);
  const [isEditAssignee, setIsEditAssignee] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  useEffect(() => {
    const followUp = task?.followUp ? new Date(task?.followUp) : null;
    setFollowUpDate(followUp);
  }, [task?.followUp]);

  useEffect(() => {
    const due = task?.due ? new Date(task?.due) : null;
    setDueDate(due);
  }, [task?.due]);

  const updateBpmTasksAndDetails = (err) => {
    if (!err) {
      if (!SocketIOService.isConnected()) {
        if (selectedFilter) {
          dispatch(getBPMTaskDetail(taskId));
          dispatch(fetchServiceTaskList(reqData, null, firstResult));
        } else {
          dispatch(setBPMTaskDetailUpdating(false));
        }
      }
    } else {
      dispatch(setBPMTaskDetailUpdating(false));
    }
  };

  const onClaim = () => {
    dispatch(setBPMTaskDetailUpdating(true));
    dispatch(
      // eslint-disable-next-line no-unused-vars
      claimBPMTask(taskId, username, updateBpmTasksAndDetails)
    );
  };

  const onChangeClaim = (userId) => {
    setIsEditAssignee(false);
    if (userId && userId !== task.assignee) {
      dispatch(setBPMTaskDetailUpdating(true));
      dispatch(
        // eslint-disable-next-line no-unused-vars
        updateAssigneeBPMTask(taskId, userId, updateBpmTasksAndDetails)
      );
    }
  };

  const onUnClaimTask = () => {
    dispatch(setBPMTaskDetailUpdating(true));
    dispatch(
      // eslint-disable-next-line no-unused-vars
      unClaimBPMTask(taskId, updateBpmTasksAndDetails)
    );
  };

  const onFollowUpDateUpdate = (followUpDate) => {
    setFollowUpDate(followUpDate);
    dispatch(setBPMTaskDetailUpdating(true));
    const updatedTask = {
      ...task,
      ...{ followUp: followUpDate ? getISODateTime(followUpDate) : null },
    };
    dispatch(
      // eslint-disable-next-line no-unused-vars
      updateBPMTask(taskId, updatedTask, updateBpmTasksAndDetails)
    );
  };

  const onDueDateUpdate = (dueDate) => {
    setDueDate(dueDate);
    dispatch(setBPMTaskDetailUpdating(true));
    const updatedTask = {
      ...task,
      ...{ due: dueDate ? getISODateTime(dueDate) : null },
    };
    dispatch(
      // eslint-disable-next-line no-unused-vars
      updateBPMTask(taskId, updatedTask, updateBpmTasksAndDetails)
    );
  };

  // eslint-disable-next-line no-unused-vars
  const FollowUpDateInput = React.forwardRef(({ value, onClick }, ref) => {
    return (
      <div onClick={onClick} ref={ref}>
        <i className="fa fa-calendar me-1" />{" "}
        {followUpDate ? (
          <span className="me-4">{moment(followUpDate).fromNow()}</span>
        ) : (
          t("Set follow-up Date")
        )}
      </div>
    );
  });

  // eslint-disable-next-line no-unused-vars
  const DueDateInput = React.forwardRef(({ value, onClick }, ref) => {
    return (
      <div onClick={onClick} ref={ref}>
        <i className="fa fa-bell me-1" />{" "}
        {dueDate ? (
          <span className="me-4">{moment(dueDate).fromNow()}</span>
        ) : (
          t("Set Due date")
        )}
      </div>
    );
  });

  const getGroups = (groups) => {
    return groups?.map((group) => group.groupId).join(", ");
  };

  return (
    <>
      <AddGroupModal
        modalOpen={showModal}
        onClose={() => setModal(false)}
        groups={taskGroups}
      />
      <Row className="mx-0 task-header">{task?.name}</Row>
      <Row className="mx-0 task-name">
        <span className="application-id">
          <OverlayTrigger
            placement="right"
            overlay={<Tooltip id="process-name">{t("Process Name")}</Tooltip>}
          >
            <span>
              {" "}
              {
                getProcessDataObjectFromList(
                  processList,
                  task?.processDefinitionId
                )?.name
              }
            </span>
          </OverlayTrigger>
        </span>
      </Row>
      <Row className="mx-0">
        <span className="application-id">
          <OverlayTrigger
            placement="right"
            overlay={<Tooltip id="submission-id">{t("Submission ID")}</Tooltip>}
          >
            <span>
              {t("Submission ID")}# {task?.applicationId}
            </span>
          </OverlayTrigger>
        </span>
      </Row>
      <Row className="actionable mb-4 mx-0">
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id="set-followup-date">
              {followUpDate
                ? getFormattedDateAndTime(followUpDate)
                : t("Set FollowUp Date")}
            </Tooltip>
          }
        >
          <Col
            sm={followUpDate ? 2 : "auto"}
            className="text-center align-self-end"
          >
            <DatePicker
              selected={followUpDate}
              onChange={onFollowUpDateUpdate}
              showTimeSelect
              isClearable
              popperPlacement="bottom-start"
              popperModifiers={{
                offset: {
                  enabled: true,
                  offset: "5px, 10px",
                },
                preventOverflow: {
                  enabled: true,
                  escapeWithReference: false,
                  boundariesElement: "viewport",
                },
              }}
              customInput={<FollowUpDateInput />}
            />
          </Col>
        </OverlayTrigger>

        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id="set-due-date">
              {dueDate ? getFormattedDateAndTime(dueDate) : t("Set Due date")}
            </Tooltip>
          }
        >
          <Col sm={dueDate ? 2 : "auto"} className="text-center align-self-end">
            <DatePicker
              selected={dueDate}
              onChange={onDueDateUpdate}
              showTimeSelect
              isClearable
              shouldCloseOnSelect
              popperPlacement="bottom-start"
              popperModifiers={{
                offset: {
                  enabled: true,
                  offset: "5px, 10px",
                },
                preventOverflow: {
                  enabled: true,
                  escapeWithReference: false,
                  boundariesElement: "viewport",
                },
              }}
              customInput={<DueDateInput />}
            />
          </Col>
        </OverlayTrigger>

        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip id="groups">{t("Groups")}</Tooltip>}
        >
          <Col
            className="d-flex flex-column align-items-center align-self-end"
            sm={4}
            onClick={() => setModal(true)}
          >
            <i className="fa fa-group me-1" />
            {taskGroups.length === 0 ? (
              <span>{t("Add groups")}</span>
            ) : (
              <span className="group-align">{getGroups(taskGroups)}</span>
            )}
          </Col>
        </OverlayTrigger>
        <Col className="right-side">
          {isEditAssignee ? (
            task?.assignee ? (
              <span>
                <UserSelectionDebounce
                  onClose={() => setIsEditAssignee(false)}
                  currentUser={task.assignee}
                  onChangeClaim={onChangeClaim}
                />
              </span>
            ) : (
              <span data-testid="clam-btn" onClick={onClaim}>
                {" "}
                {t("Claim")}
              </span>
            )
          ) : (
            <>
              <i className="fa fa-user me-1" />
              {task?.assignee ? (
                <span>
                  <OverlayTrigger
                    placement="bottom"
                    overlay={
                      <Tooltip id="change-assignee">
                        {t("Click to Change Assignee")}
                      </Tooltip>
                    }
                  >
                    <span className="" onClick={() => setIsEditAssignee(true)}>
                      {task.assignee}
                    </span>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="bottom"
                    overlay={
                      <Tooltip id="reset-assignee">
                        {t("Reset Assignee")}
                      </Tooltip>
                    }
                  >
                    <i className="fa fa-times ms-1" onClick={onUnClaimTask} />
                  </OverlayTrigger>
                </span>
              ) : (
                <span data-testid="clam-btn" onClick={onClaim}>
                  {t("Claim")}
                </span>
              )}
            </>
          )}
        </Col>
      </Row>
    </>
  );
});

export default TaskHeader;
