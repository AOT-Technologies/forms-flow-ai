import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import { form, forms, submission, submissions } from "react-formio";

import user from "./userDetailReducer";
import taskAppHistory from "./taskAppHistoryReducer";
import formDelete from "./formReducer";
import insights from "./insightReducer";
import metrics from "./metricsReducer";
import process from "./processReducer";
import applications from './applicationsReducer';
import menu from './menuReducer';
import bpmTasks from './bpmTaskReducer';
import bpmForms from './bpmFormReducer';
import formCheckList from './formCheckListReducer';
import dashboardReducer from "./dashboardReducer";

const createRootReducer = (history) =>
  combineReducers({
    user,
    taskAppHistory,
    insights,
    formDelete,
    applications,
    bpmTasks,
    bpmForms,
    form: form({ name: "form" }),
    forms: forms({ name: "forms", query: { type: "form", tags: "common", title__regex: "" }, sort: "title" }),
    submission: submission({ name: "submission" }),
    submissions: submissions({ name: "submissions" }),
    router: connectRouter(history),
    metrics,
    process,
    menu,
    formCheckList,
    dashboardReducer
  });

export default createRootReducer;
