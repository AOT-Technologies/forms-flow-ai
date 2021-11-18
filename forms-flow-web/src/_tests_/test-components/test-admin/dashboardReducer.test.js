import '@testing-library/jest-dom/extend-expect';
import {checkDashboardIngroups,removeDashboardFromGroup,removeGroupFromDashboard,adddashboardToGroup,addGroupToDashboard} from '../../../modules/dashboardReducer'
import {dashboard,dashboards,dashboards1,groups,approvedGroups,groups1,groups2,groups3,addGroupToDashOutput} from './constants'

test('Should select the groups where the given dashboard is present',()=>{
    expect(checkDashboardIngroups(dashboard,groups)).toEqual(approvedGroups);
    expect(checkDashboardIngroups(dashboard,groups1)).toEqual([])
})

test('Should remove the given dashboard from the group',()=>{
    expect(removeDashboardFromGroup(dashboard,approvedGroups[0],groups)).toEqual(groups3);
    expect(removeDashboardFromGroup(dashboard,approvedGroups[1],groups)).toEqual(groups);
})

test("should remove the group from the approved dashboards array",()=>{
    expect(removeGroupFromDashboard(dashboard,dashboards,approvedGroups[0])).toEqual(dashboards1);
    expect(removeGroupFromDashboard(dashboard,dashboards,approvedGroups[1])).toEqual(dashboards);
})

test('Should add the given dashboard to the group',()=>{
    expect(adddashboardToGroup(dashboard,approvedGroups[0],groups1)).toEqual(groups2);
    expect(adddashboardToGroup(dashboard,{},groups1)).toEqual(groups1);
})
test('Should add the given group to the approved dashboards array',()=>{
    expect(addGroupToDashboard(dashboard,dashboards1,approvedGroups[0])).toEqual(addGroupToDashOutput);
    expect(addGroupToDashboard(dashboard,dashboards1,{})).toEqual(dashboards1);
})


