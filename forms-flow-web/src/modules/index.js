import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import { form, forms, submission, submissions } from "react-formio";

import user from "./userDetailReducer";
import tasks from "./tasksReducer";
import formDelete from "./formReducer";
import insights from "./insightReducer";
import metrics from "./metricsReducer";
import process from "./processReducer";
import applications from './applicationsReducer';
import menu from './menuReducer';
import bpmTasks from './bpmTaskReducer';
import bpmForms from './bpmFormReducer';

const createRootReducer = (history) =>
  combineReducers({
    user,
    tasks,
    insights,
    formDelete,
    applications,
    bpmTasks,
    bpmForms,
    form: form({ name: "form" }),
    forms: forms({ name: "forms", query: { type: "form", tags: "common" }, sort: "-created" }),
    submission: submission({ name: "submission" }),
    submissions: submissions({ name: "submissions" }),
    router: connectRouter(history),
    metrics,
    process,
    menu
  });

export default createRootReducer;
