import { combineReducers } from 'redux';
import user from './../../modules/userDetailReducer';
import bpmForms from './../../modules/bpmFormReducer';
import formCheckList from '../../modules/formCheckListReducer';
import tenants from '../../modules/tenantReducer';
import processReducer from '../../modules/processReducer';
import formDelete from '../../modules/formReducer';
const rootReducer = combineReducers({
    user,
    bpmForms,
    formCheckList,
    tenants,
    process: processReducer,
    formDelete,
});

export default rootReducer;