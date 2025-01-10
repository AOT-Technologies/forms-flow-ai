import React, { useEffect, useState } from "react";
 import { Col } from "react-bootstrap";
import {
  getISODateTime,
  getFormattedDateAndTime,
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
// import SocketIOService from "../../../services/SocketIOService";
import { useTranslation } from "react-i18next";
import  userRoles   from "../../../constants/permissions";

const TaskHeaderListView = React.memo(({task,taskId,groupView = true}) => {
  const username = useSelector(
    (state) => state.user?.userDetail?.preferred_username || ""
  );
  const taskGroups = useSelector((state) => state.bpmTasks.taskGroups);
  // const selectedFilter = useSelector((state) => state.bpmTasks.selectedFilter);
  const reqData = useSelector((state) => state.bpmTasks.listReqParams);
  const vissibleAttributes = useSelector((state) => state.bpmTasks.vissibleAttributes);
  const firstResult = useSelector((state) => state.bpmTasks.firstResult);
  const [followUpDate, setFollowUpDate] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [showModal, setModal] = useState(false);
  const [isEditAssignee, setIsEditAssignee] = useState(false);
  const { manageTasks } = userRoles();

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const RETRY_DELAY_TIME = 2000;

  useEffect(() => {
    const followUp = task?.followUp ? new Date(task?.followUp) : null;
    setFollowUpDate(followUp);
  }, [task?.followUp]);

  useEffect(() => {
    const due = task?.due ? new Date(task?.due) : null;
    setDueDate(due);
  }, [task?.due]);

  const updateBpmTasksAndDetails = (err) =>{
    // if (!err) {
    //   if (!SocketIOService.isConnected()) {
    //     if (selectedFilter) {
    //       dispatch(getBPMTaskDetail(taskId));
    //       dispatch(
    //         fetchServiceTaskList(reqData,null,firstResult)
    //       );
    //     } else {
    //       dispatch(setBPMTaskDetailUpdating(false));
    //     }
    //   }
    // } else {
    //   dispatch(setBPMTaskDetailUpdating(false));
    // }
    // Above code commented and added below 3 lines for refreshing the tasks on each update operation without checking conditions.
    if(err)
      console.log('Error in task updation-',err);
    retryTaskUpdate(taskId, reqData, firstResult, dispatch);
  };

  const onClaim = () => {
    dispatch(setBPMTaskDetailUpdating(true));
    dispatch(
      // eslint-disable-next-line no-unused-vars
      claimBPMTask(taskId, username,updateBpmTasksAndDetails)
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
      updateBPMTask(taskId, updatedTask, updateBpmTasksAndDetails)
    );
  };

  const FollowUpDateInput = React.forwardRef(({ onClick }, ref) => (
    <div onClick={manageTasks ? onClick : undefined} ref={ref} style={{ cursor: manageTasks ? 'pointer' : 'default' }}>
      <i className="fa fa-calendar me-1" />{" "}
      {followUpDate ? (
        <span className="me-4">{moment(followUpDate).fromNow()}</span>
      ) : (
        t("Add Date")
      )}
    </div>
  ));

  const DueDateInput = React.forwardRef(({ onClick }, ref) => (
    <div onClick={manageTasks ? onClick : undefined} ref={ref} style={{ cursor: manageTasks ? 'pointer' : 'default' }}>
      <i className="fa fa-calendar me-1" />{" "}
      {dueDate ? (
        <span className="me-4">{moment(dueDate).fromNow()}</span>
      ) : (
        t("Add Date")
      )}
    </div>
  ));

  const getGroups = (groups) => {
    return groups?.map((group) => group.groupId).join(", ");
  };

  // Utility function for retry logic
  const retryTaskUpdate = (taskId, reqData, firstResult, dispatch) => {
    setTimeout(() => {
      dispatch(getBPMTaskDetail(taskId));
      dispatch(fetchServiceTaskList(reqData, null, firstResult));
      dispatch(setBPMTaskDetailUpdating(false));
    }, RETRY_DELAY_TIME);
  };

  return (
    <>
      <AddGroupModal
        modalOpen={showModal}
        onClose={() => setModal(false)}
        groups={taskGroups}
      />

      {vissibleAttributes?.taskVisibleAttributes?.followUp && (
        <Col xs={2} className="px-0">
          <div className="">
            <div>
              <h6 className="fw-bold">{t("Follow up Date")}</h6>
            </div>
            <div
              className="actionable"
              title={
                followUpDate
                  ? getFormattedDateAndTime(followUpDate)
                  : t("Set follow-up Date")
              }
              style={{ cursor: !manageTasks ? 'default' : 'pointer' }}
            >
              {manageTasks ? (
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
              ) : (
                <span>{followUpDate ? getFormattedDateAndTime(followUpDate) : t("No Date")}</span>
              )}
            </div>
          </div>
        </Col>
      )}

      {vissibleAttributes?.taskVisibleAttributes?.dueDate && (
        <Col xs={2} className="px-0">
          <div className="">
            <div>
               <h6 className="fw-bold">{t("Due Date")}</h6>
            </div>
            <div
              className="actionable"
              title={
                dueDate ? getFormattedDateAndTime(dueDate) : t("Set Due date")
              }
              style={{ cursor: !manageTasks ? 'default' : 'pointer' }}
            >
              {manageTasks ? (
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
              ) : (
                <span>{dueDate ? getFormattedDateAndTime(dueDate) : t("No Date")}</span>
              )}
            </div>
          </div>
        </Col>
      )}

      {vissibleAttributes?.taskVisibleAttributes?.assignee && (
        <Col xs={3} onClick={(e) => e.stopPropagation()}>
          <div className="">
            <div>
              <h6 className="fw-bold">{t("Assignee")}</h6>
            </div>
            <div className="actionable word-break" style={{ cursor: !manageTasks ? 'default' : 'pointer' }}>
              {isEditAssignee && manageTasks ? (
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
                    {t("Assign to Me")}
                  </span>
                )
              ) : (
                <>
                  <i className="fa fa-user me-1" />
                  {task?.assignee ? (
                    <span>
                      <span
                        className=""
                        onClick={() => manageTasks && setIsEditAssignee(true)}
                        title={t("Click to Change Assignee")}
                        style={{ cursor: manageTasks ? 'pointer' : 'default' }}
                      >
                        {task.assignee}
                      </span>
                      {manageTasks && (
                        <i
                          className="fa fa-times ms-1"
                          onClick={onUnClaimTask}
                          title={t("Reset Assignee")}
                          style={{ cursor: 'pointer' }}
                        />
                      )}
                    </span>
                  ) : (
                    <span data-testid="clam-btn" onClick={manageTasks ? onClaim : undefined} style={{ cursor: manageTasks ? 'pointer' : 'default' }}>
                      {t("Assign to Me")}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </Col>
      )}

      {groupView && (
        <Col xs={3}>
          <div className="">
            <div>
              <h6 className="fw-bold">{t("Groups")}</h6>
            </div>
            <div
              className="actionable d-flex"
              onClick={() => manageTasks && setModal(true)}
              title={t("Groups")}
              style={{ cursor: !manageTasks ? 'default' : 'pointer' }}
            >
              <i className="fa fa-group me-1" />
              {taskGroups.length === 0 ? (
                <span>{t("Add group")}</span>
              ) : (
                <span className="group-align">{getGroups(taskGroups)}</span>
              )}
            </div>
          </div>
        </Col>
      )}
    </>
  );
});

export default TaskHeaderListView;
