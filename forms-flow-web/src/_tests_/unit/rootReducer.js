import { combineReducers } from 'redux';
import user from './../../modules/userDetailReducer';
import bpmForms from './../../modules/bpmFormReducer';
import formCheckList from '../../modules/formCheckListReducer';
import tenants from '../../modules/tenantReducer';

const rootReducer = combineReducers({
    user,
    bpmForms,
    formCheckList,
    tenants
});

export default rootReducer;