import { combineReducers } from 'redux';

import user from './../../modules/userDetailReducer';
import bpmForms from './../../modules/bpmFormReducer';
import formCheckList from '../../modules/formCheckListReducer';
import tenants from '../../modules/tenantReducer';
import processReducer from '../../modules/processReducer';
import formDelete from '../../modules/formReducer';
import { form, forms,submission } from "@aot-technologies/formio-react";
import formRestore from "../../modules/RestoreFormReducer";
import applications from '../../modules/applicationsReducer';
import taskAppHistory from '../../modules/taskAppHistoryReducer';

const rootReducer = combineReducers({
    user,
    bpmForms,
    form: form({ name: "form" }),
    forms: forms({
      name: "forms",
      limit: 10,
      query: { type: "form", tags: "common", title__regex: "" },
      sort: "title",
    }),
    formCheckList,
    formRestore,
    tenants,
    process: processReducer,
    formDelete,
    applications,
    taskAppHistory,
    submission: submission({ name: "submission" }),
    customSubmission: () => ({}),
});

export default rootReducer;
