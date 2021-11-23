import '@testing-library/jest-dom/extend-expect';
import {checkDashboardIngroups} from '../../../modules/dashboardReducer'
import {dashboard,dashboards,dashboards1,groups,approvedGroups,groups1,groups2,groups3,addGroupToDashOutput} from './constants'

test('Should select the groups where the given dashboard is present',()=>{
    expect(checkDashboardIngroups(dashboard,groups)).toEqual(approvedGroups);
    expect(checkDashboardIngroups(dashboard,groups1)).toEqual([])
})




