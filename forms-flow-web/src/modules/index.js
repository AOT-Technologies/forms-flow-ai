import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import { form, forms, submission, submissions } from "react-formio";

import user from "./userDetailReducer";
import taskAppHistory from "./taskAppHistoryReducer";
import formDelete from "./formReducer";
import insights from "./insightReducer";
import metrics from "./metricsReducer";
import process from "./processReducer";
import applications from "./applicationsReducer";
import menu from "./menuReducer";
import bpmTasks from "./bpmTaskReducer";
import bpmForms from "./bpmFormReducer";
import formCheckList from "./formCheckListReducer";
import dashboardReducer from "./dashboardReducer";
import tenantReducer from "./tenantReducer";
import draftSubmission from "./draftReducer";
import formRestore from "./RestoreFormReducer";
import pubSubReducer from "./pubSubReducer";
import userAuthorization from "./authorizationReducer";
import customSubmissionReducer from "./customSubmissionReducer";
import ErrorHandling from "./ErrorHandlingReducer";

const createRootReducer = (history) =>
  combineReducers({
    user,
    taskAppHistory,
    insights,
    formDelete,
    customSubmission:customSubmissionReducer,
    applications,
    bpmTasks,
    bpmForms,
    formRestore,
    errors:ErrorHandling,
    form: form({ name: "form" }),
    forms: forms({
      name: "forms",
      limit: 5,
      query: { type: "form", tags: "common", title__regex: "" },
      sort: "title",
    }),
    submission: submission({ name: "submission" }),
    submissions: submissions({ name: "submissions" }),
    router: connectRouter(history),
    metrics,
    process,
    menu,
    formCheckList,
    dashboardReducer,
    tenants: tenantReducer,
    draft: draftSubmission,
    pubSub: pubSubReducer,
    userAuthorization:userAuthorization
  });

export default createRootReducer;
