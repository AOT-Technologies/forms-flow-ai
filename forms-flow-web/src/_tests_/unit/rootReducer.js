import { combineReducers } from 'redux';

import user from './../../modules/userDetailReducer';
import bpmForms from './../../modules/bpmFormReducer';
import formCheckList from '../../modules/formCheckListReducer';
import tenants from '../../modules/tenantReducer';
import processReducer from '../../modules/processReducer';
import formDelete from '../../modules/formReducer';
import applications from '../../modules/applicationsReducer';
import taskAppHistory from '../../modules/taskAppHistoryReducer';
import { submission, form } from "@aot-technologies/formio-react";

const rootReducer = combineReducers({
    user,
    bpmForms,
    formCheckList,
    tenants,
    process: processReducer,
    formDelete,
    applications,
    taskAppHistory,
    submission: submission({ name: "submission" }),
    form: form({ name: "form" }),
});

export default rootReducer;
