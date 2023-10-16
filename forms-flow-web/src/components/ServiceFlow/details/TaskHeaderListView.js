import React, { useEffect, useState } from "react";
 import { Row, Col } from "react-bootstrap";
import {
  getISODateTime,
  getFormattedDateAndTime,
  // getProcessDataObjectFromList,
} from "../../../apiManager/services/formatterService";
import { useDispatch, useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import "./../ServiceFlow.scss";
import AddGroupModal from "./AddGroupModal";
import {
  claimBPMTask,
  // fetchFilterList,
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

const TaskHeaderListView = React.memo(({task,taskId,groupView = true}) => {
  // const task = useSelector((state) => state.bpmTasks.taskDetail);
  // const taskId = useSelector((state) => state.bpmTasks.taskId);
  // const processList = useSelector((state) => state.bpmTasks.processList);
  const username = useSelector(
    (state) => state.user?.userDetail?.preferred_username || ""
  );
  const taskGroups = useSelector((state) => state.bpmTasks.taskGroups);
  const selectedFilter = useSelector((state) => state.bpmTasks.selectedFilter);
  const reqData = useSelector((state) => state.bpmTasks.listReqParams);
  const vissibleAttributes = useSelector((state) => state.bpmTasks.vissibleAttributes);
  // const firstResult = useSelector((state) => state.bpmTasks.firstResult);
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

  const onClaim = () => {
    dispatch(setBPMTaskDetailUpdating(true));
    dispatch(
      // eslint-disable-next-line no-unused-vars
      claimBPMTask(taskId, username, (err, response) => {
        if (!err) {
          if (!SocketIOService.isConnected()) {
            if (selectedFilter) {
              dispatch(getBPMTaskDetail(taskId));
              console.log("calling 12");
              dispatch(
                fetchServiceTaskList(reqData)
              );
            } else {
              dispatch(setBPMTaskDetailUpdating(false));
            }
          }
          if(selectedFilter){
            console.log("calling 13");
            dispatch(
              fetchServiceTaskList(reqData)
            );
          }
           
        } else {
          dispatch(setBPMTaskDetailUpdating(false));
        }
      })
    );
  };
  const onChangeClaim = (userId) => {
    setIsEditAssignee(false);
    if (userId && userId !== task.assignee) {
      dispatch(setBPMTaskDetailUpdating(true));
      dispatch(
        // eslint-disable-next-line no-unused-vars
        updateAssigneeBPMTask(taskId, userId, (err, response) => {
          if (!err) {
            if (!SocketIOService.isConnected()) {
              if (selectedFilter) {
                dispatch(getBPMTaskDetail(taskId));
              }
            }
            if(selectedFilter){
              console.log("calling 14");
              dispatch(
                fetchServiceTaskList(reqData)
              );
            }
           
          } else {
            dispatch(setBPMTaskDetailUpdating(false));
          }
        })
      );
    }
  };

  const onUnClaimTask = () => {
    dispatch(setBPMTaskDetailUpdating(true));
    dispatch(
      // eslint-disable-next-line no-unused-vars
      unClaimBPMTask(taskId, (err, response) => {
        if (!err) {
          if (!SocketIOService.isConnected()) {
            if (selectedFilter) {
              dispatch(getBPMTaskDetail(taskId));
            }
          }
          if(selectedFilter){
            console.log("calling 15");
            dispatch(
              fetchServiceTaskList(reqData)
            );
          }
          
        } else {
          dispatch(setBPMTaskDetailUpdating(false));
        }
      })
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
      updateBPMTask(taskId, updatedTask, (err, response) => {
        if (!err) {
          if (!SocketIOService.isConnected()) {
            dispatch(getBPMTaskDetail(taskId));
            console.log("calling 16");
            dispatch(
              fetchServiceTaskList(reqData)
            );
          }
        } else {
          dispatch(setBPMTaskDetailUpdating(false));
        }
      })
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
      updateBPMTask(taskId, updatedTask, (err, response) => {
        if (!err) {
          if (!SocketIOService.isConnected()) {
            dispatch(getBPMTaskDetail(taskId));
            console.log("calling 17");
            dispatch(
              fetchServiceTaskList(reqData)
            );
          }
        } else {
          dispatch(setBPMTaskDetailUpdating(false));
        }
      })
    );
  };

  // eslint-disable-next-line no-unused-vars
  const FollowUpDateInput = React.forwardRef(({ value, onClick }, ref) => {
    return (
      <div onClick={onClick} ref={ref}>
        <i className="fa fa-calendar mr-1" />{" "}
        {followUpDate ? (
          <span className="mr-4">{moment(followUpDate).fromNow()}</span>
        ) : (
          t("Add Date")
        )}
      </div>
    );
  });

  // eslint-disable-next-line no-unused-vars
  const DueDateInput = React.forwardRef(({ value, onClick }, ref) => {
    return (
      <div onClick={onClick} ref={ref}>
        <i className="fa fa-calendar mr-1" />{" "}
        {dueDate ? (
          <span className="mr-4">{moment(dueDate).fromNow()}</span>
        ) : (
          t("Add Date")
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

      <Row>
      {vissibleAttributes.taskVisibleAttributes.dueDate &&  <Col xs={3} className="px-0">
          <div className="tab-width">
            <div>
              <h6 className="font-weight-light">Follow-up Date</h6>
            </div>
            <div
              className="actionable"
              data-title={
                followUpDate
                  ? getFormattedDateAndTime(followUpDate)
                  : t("Set follow-up Date")
              }
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
            </div>
          </div>
        </Col>}
        <Col xs={3}>
          <div className="tab-width">
            <div>
              <h6 className="font-weight-light">Due Date</h6>
            </div>
            <div
              className="actionable"
              data-title={
                dueDate ? getFormattedDateAndTime(dueDate) : t("Set Due date")
              }
            >
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
            </div>
          </div>
        </Col>
      {vissibleAttributes.taskVisibleAttributes.assignee &&  <Col xs={3}>
          <div className="tab-width">
            <div>
              <h6 className="font-weight-light">Assignee</h6>
            </div>
            <div className="actionable">
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
                    {t("Assign to Me")}
                  </span>
                )
              ) : (
                <>
                  <i className="fa fa-user mr-1" />
                  {task?.assignee ? (
                    <span>
                      <span
                        className="change-tooltip"
                        onClick={() => setIsEditAssignee(true)}
                        data-title={t("Click to Change Assignee")}
                      >
                        {task.assignee}
                      </span>
                      <i
                        className="fa fa-times ml-1"
                        onClick={onUnClaimTask}
                        data-title={t("Reset Assignee")}
                      />
                    </span>
                  ) : (
                    <span data-testid="clam-btn" onClick={onClaim}>
                      {t("Assign to Me")}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </Col>}
        <Col xs={3}> 
          {groupView &&
            <div className="tab-width">
              <div>
                <h6 className="font-weight-light">Groups</h6>
              </div>
              <div
                className="actionable"
                onClick={() => setModal(true)}
                data-title={t("groups")}
              >
                <i className="fa fa-group mr-1" />
                {taskGroups.length === 0 ? (
                  <span>{t("Add group")}</span>
                ) : (
                  <span className="group-align">{getGroups(taskGroups)}</span>
                )}
              </div>
            </div>}
        </Col>
      </Row>

      
    </>
  );
});

export default TaskHeaderListView;
