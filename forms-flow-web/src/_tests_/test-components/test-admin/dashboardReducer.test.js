import '@testing-library/jest-dom/extend-expect';
import { getCleanedDashboards } from '../../../apiManager/services/dashboardsService';
import {checkDashboardIngroups} from '../../../modules/dashboardReducer'
import {dashboard, dashboardToclean, cleanedDashboards, groups, approvedGroups, groups1} from './constants'



test('Should select the groups where the given dashboard is present',()=>{
    expect(checkDashboardIngroups(dashboard,groups)).toEqual(approvedGroups);
    expect(checkDashboardIngroups(dashboard,groups1)).toEqual([])
})

test('should clean the data structure to expected format',()=>{
    expect(getCleanedDashboards(dashboardToclean)).toEqual(cleanedDashboards);
})
