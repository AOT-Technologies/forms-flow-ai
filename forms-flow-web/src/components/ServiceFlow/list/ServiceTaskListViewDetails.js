import React, { useCallback, useEffect, useState } from "react";
import { Row, Col, Tab, Tabs, Card } from "react-bootstrap";
import { Link } from 'react-router-dom';
import {
    reloadTaskFormSubmission,
    setBPMTaskDetailLoader,
    setSelectedTaskID,
} from "../../../actions/bpmTaskActions";
import {
    fetchServiceTaskList,
    getBPMGroups,
    getBPMTaskDetail,
    onBPMTaskFormSubmit,
} from "../../../apiManager/services/bpmTaskServices";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../../../containers/Loading";
import ProcessDiagram from "../../BPMN/ProcessDiagramHook";
import {
    getFormIdSubmissionIdFromURL,
    getFormUrlWithFormIdSubmissionId,
    getProcessDataObjectFromList,
} from "../../../apiManager/services/formatterService";
import History from "../../Application/ApplicationHistory";
import FormEdit from "../../Form/Item/Submission/Item/Edit";
import FormView from "../../Form/Item/Submission/Item/View";
import LoadingOverlay from "react-loading-overlay";
import { getForm, getSubmission, Formio } from "react-formio";
import { CUSTOM_EVENT_TYPE } from "../constants/customEventTypes";
import { getTaskSubmitFormReq } from "../../../apiManager/services/bpmServices";
import { useParams } from "react-router-dom";
import { push } from "connected-react-router";
import {
    resetFormData,
    setFormSubmissionLoading,
} from "../../../actions/formActions";
import { useTranslation } from "react-i18next";
import {
    CUSTOM_SUBMISSION_URL,
    CUSTOM_SUBMISSION_ENABLE,
    MULTITENANCY_ENABLED,
    BASE_ROUTE
} from "../../../constants/constants";
import { getCustomSubmission } from "../../../apiManager/services/FormServices";
import { getFormioRoleIds } from "../../../apiManager/services/userservices";
import TaskHeaderListView from "../details/TaskHeaderListView";

const ServiceTaskListViewDetails = React.memo(() => {
    const { t } = useTranslation();
    const { taskId } = useParams();
    const bpmTaskId = useSelector((state) => state.bpmTasks.taskId);
    const task = useSelector((state) => state.bpmTasks.taskDetail);
    const processList = useSelector((state) => state.bpmTasks.processList);
    const isTaskLoading = useSelector(
        (state) => state.bpmTasks.isTaskDetailLoading
    );
    const isTaskUpdating = useSelector(
        (state) => state.bpmTasks.isTaskDetailUpdating
    );
    const reqData = useSelector((state) => state.bpmTasks.listReqParams);
    const taskFormSubmissionReload = useSelector(
        (state) => state.bpmTasks.taskFormSubmissionReload
    );
    const dispatch = useDispatch();
    const currentUser = useSelector(
        (state) => state.user?.userDetail?.preferred_username || ""
    );
    const selectedFilter = useSelector((state) => state.bpmTasks.selectedFilter);
    const firstResult = useSelector((state) => state.bpmTasks.firstResult);
    const [processKey, setProcessKey] = useState("");
    const [processTenant, setProcessTenant] = useState(null);
    const [processInstanceId, setProcessInstanceId] = useState("");
    const tenantKey = useSelector((state) => state.tenants?.tenantId);
    const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";

    useEffect(() => {
        if (taskId) {
            dispatch(setSelectedTaskID(taskId));
        }
    }, [taskId, dispatch]);

    useEffect(() => {
        if (bpmTaskId) {
            dispatch(setBPMTaskDetailLoader(true));
            dispatch(getBPMTaskDetail(bpmTaskId));
            dispatch(getBPMGroups(bpmTaskId));
        }
        return () => {
            Formio.clearCache();
        };
    }, [bpmTaskId, dispatch]);

    useEffect(() => {
        if (processList.length && task?.processDefinitionId) {
            const pKey = getProcessDataObjectFromList(
                processList,
                task?.processDefinitionId
            );
            setProcessKey(pKey["key"]);
            setProcessTenant(pKey["tenantId"]);
        }
    }, [processList, task?.processDefinitionId]);

    useEffect(() => {
        if (task?.processInstanceId) {
            setProcessInstanceId(task?.processInstanceId);
        }
    }, [task?.processInstanceId]);

    const getFormSubmissionData = useCallback(
        (formUrl) => {
            const { formId, submissionId } = getFormIdSubmissionIdFromURL(formUrl);
            Formio.clearCache();
            dispatch(resetFormData("form"));
            function fetchForm() {
                dispatch(
                    getForm("form", formId, (err) => {
                        if (!err) {
                            if (CUSTOM_SUBMISSION_URL && CUSTOM_SUBMISSION_ENABLE) {
                                dispatch(getCustomSubmission(submissionId, formId));
                            } else {
                                dispatch(getSubmission("submission", submissionId, formId));
                            }
                            dispatch(setFormSubmissionLoading(false));
                        } else {
                            if (err === "Bad Token" || err === "Token Expired") {
                                dispatch(resetFormData("form"));
                                dispatch(
                                    getFormioRoleIds((err) => {
                                        if (!err) {
                                            fetchForm();
                                        } else {
                                            dispatch(setFormSubmissionLoading(false));
                                        }
                                    })
                                );
                            } else {
                                dispatch(setFormSubmissionLoading(false));
                            }
                        }
                    })
                );
            }
            fetchForm();
        },
        [dispatch]
    );

    useEffect(() => {
        if (task?.formUrl) {
            getFormSubmissionData(task?.formUrl);
        }
    }, [task?.formUrl, dispatch, getFormSubmissionData]);

    useEffect(() => {
        if (task?.formUrl && taskFormSubmissionReload) {
            dispatch(setFormSubmissionLoading(false));
            getFormSubmissionData(task?.formUrl);
            dispatch(reloadTaskFormSubmission(false));
        }
    }, [
        task?.formUrl,
        taskFormSubmissionReload,
        dispatch,
        getFormSubmissionData,
    ]);

    const reloadTasks = () => {
        dispatch(setBPMTaskDetailLoader(true));
        dispatch(setSelectedTaskID(null)); // unSelect the Task Selected
        dispatch(fetchServiceTaskList(reqData,null,firstResult)); //Refreshes the Tasks
        dispatch(push(`${redirectUrl}task/`));
    };

    const reloadCurrentTask = () => {
        if (selectedFilter && task?.id) {
            dispatch(setBPMTaskDetailLoader(true));
            dispatch(
                getBPMTaskDetail(task.id, (err, taskDetail) => {
                    if (!err) {
                        dispatch(setFormSubmissionLoading(true));
                        getFormSubmissionData(taskDetail?.formUrl);
                    }
                })
            ); // Refresh the Task Selected
            dispatch(getBPMGroups(task?.id));
            dispatch(fetchServiceTaskList(reqData,null,firstResult)); //Refreshes the Tasks

        }
    };

    const onCustomEventCallBack = (customEvent) => {
        switch (customEvent.type) {
            case CUSTOM_EVENT_TYPE.RELOAD_TASKS:
                reloadTasks();
                break;
            case CUSTOM_EVENT_TYPE.RELOAD_CURRENT_TASK:
                reloadCurrentTask();
                break;
            case CUSTOM_EVENT_TYPE.ACTION_COMPLETE:
                onFormSubmitCallback(customEvent.actionType);
                break;
            default:
                return;
        }
    };

    const onFormSubmitCallback = (actionType = "") => {
        if (bpmTaskId) {
            dispatch(setBPMTaskDetailLoader(true));
            const { formId, submissionId } = getFormIdSubmissionIdFromURL(
                task?.formUrl
            );
            const formUrl = getFormUrlWithFormIdSubmissionId(formId, submissionId);
            const origin = `${window.location.origin}${redirectUrl}`;
            const webFormUrl = `${origin}form/${formId}/submission/${submissionId}`;
            dispatch(
                onBPMTaskFormSubmit(
                    bpmTaskId,
                    getTaskSubmitFormReq(
                        formUrl,
                        task?.applicationId,
                        actionType,
                        webFormUrl
                    ),
                    (err) => {
                        if (!err) {
                            reloadTasks();
                        } else {
                            dispatch(setBPMTaskDetailLoader(false));
                        }
                    }
                )
            );
        } else {
            reloadCurrentTask();
        }
    };

    const handleBackButton = () => {
        dispatch(setSelectedTaskID(null));
    };

    if (!bpmTaskId) {
        return (
            <Row className="not-selected mt-2 ml-1 " style={{ color: "#757575" }}>
                <i className="fa fa-info-circle mr-2 mt-1" />
                {t("Select a task in the list.")}
            </Row>
        );
    } else if (isTaskLoading) {
        return (
            <div className="service-task-details">
                <Loading />
            </div>
        );
    } else {
        /*TODO split render*/
        return (
            <div className="service-task-details">
                <Link to={`${BASE_ROUTE}task`} className="btn px-0 border-0" onClick={handleBackButton} >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                        <path d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                    </svg> Back to task
                </Link>
                <LoadingOverlay active={isTaskUpdating} spinner text={t("Loading...")}>
                    <Card className="mr-2 bg-light">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <Col xs={4}>
                                    <Row className="ml-0 task-header">{task?.name}</Row>
                                    <Row className="ml-0 task-name">
                                        <span className="application-id" data-title={t("Process Name")}>
                                            {" "}
                                            {
                                                getProcessDataObjectFromList(processList,
                                                    task?.processDefinitionId)
                                                    ?.name
                                            }
                                        </span>
                                    </Row>
                                    <Row className="ml-0">
                                        <span data-title={t("Application ID")} className="application-id">
                                            {t("Application ID")}# {task?.applicationId}
                                        </span>
                                    </Row>
                                </Col>
                                <Col xs={8}>
                                    <TaskHeaderListView
                                        task={task} taskId={task?.id} groupView={true}
                                    />
                                </Col>
                           </div>
                        </Card.Body>
                    </Card>               
                    <div className="m-2">
                        <Tabs defaultActiveKey="form" id="service-task-details" mountOnEnter>
                            <Tab eventKey="form" title={t("Form")}>
                                <LoadingOverlay
                                    active={task?.assignee !== currentUser}
                                    styles={{
                                        overlay: (base) => ({
                                            ...base,
                                            background: "rgba(0, 0, 0, 0.2)",
                                            cursor: "not-allowed !important",
                                        }),
                                    }}
                                >
                                    {task?.assignee === currentUser ? (
                                        <FormEdit
                                            onFormSubmit={onFormSubmitCallback}
                                            onCustomEvent={onCustomEventCallBack}
                                        />
                                    ) : (
                                        <FormView showPrintButton={false} />
                                    )}
                                </LoadingOverlay>
                            </Tab>
                            <Tab eventKey="history" title={t("History")}>
                                <History applicationId={task?.applicationId} />
                            </Tab>
                            <Tab eventKey="diagram" title={t("Diagram")}>
                                <div>
                                    <ProcessDiagram
                                        processKey={processKey}
                                        processInstanceId={processInstanceId}
                                        tenant={processTenant}
                                    // markers={processActivityList}
                                    />
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                </LoadingOverlay>
            </div>
        );
    }
});

export default ServiceTaskListViewDetails;
