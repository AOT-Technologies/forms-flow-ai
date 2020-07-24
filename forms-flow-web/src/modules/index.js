import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import { form, forms, submission, submissions } from "react-formio";

import user from "./userDetailReducer";
import tasks from "./tasksReducer";
import formDelete from "./formReducer";
import insights from "./insightReducer";
import metrics from "./metricsReducer";
import process from "./processReducer";

const createRootReducer = (history) =>
  combineReducers({
    user,
    tasks,
    insights,
    formDelete,
    form: form({ name: "form" }),
    forms: forms({ name: "forms", query: { type: "form", tags: "common" } }),
    submission: submission({ name: "submission" }),
    submissions: submissions({ name: "submissions" }),
    router: connectRouter(history),
    metrics,
    process,
  });

export default createRootReducer;
