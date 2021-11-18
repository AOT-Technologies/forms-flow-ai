import ACTION_CONSTANTS from "../actions/actionConstants";


export const initialState = {
    dashboards:[
        {
            id:'',
            name:'',
            approvedGroups:[],
        }        
    ],
    isloading:true,
    iserror:false,
    groups: [],
    isDashUpdated:false,
    isGroupUpdated:false,
    isUpdating:false,
    updateError:false
		
}


const dashboards = (state=initialState,action)=>{
    switch(action.type){
       
        case ACTION_CONSTANTS.GET_DASHBOARDS:
            let dashboards = action.payload.results.map(result=>({'id':result.id,name:result.name}));
            return {...state,dashboards:dashboards,isDashUpdated:true};

        case ACTION_CONSTANTS.DASHBOARDS_FETCH_ERROR:
            return {...state,iserror:true,error:action.payload}

        case ACTION_CONSTANTS.FETCH_KEYCLOAK_GROUPES:
            
            return {...state,groups:action.payload,isGroupUpdated:true,updateError:false}

        case ACTION_CONSTANTS.UPDATE_DASHBOARDS_FROM_GROUPS:

            let dashboardsFromState = [...action.payload.dashboards];
            let groups = [...action.payload.groups];
            for(let dashboard of dashboardsFromState){
               let res =  checkDashboardIngroups(dashboard,groups)
               dashboard.approvedGroups = res;
            }

            return {...state,dashboards:dashboardsFromState,isUpdating:false,isloading:false}
        
        case ACTION_CONSTANTS.CLEAN_UP:
            return {...state,isDashUpdated:false,isGroupUpdated:false,isloading:true}

        // handles the remove permission to a group scenario
        case ACTION_CONSTANTS.UPDATE_DASH_GROUPS:
            const updatedGroups = removeDashboardFromGroup(action.payload.rowData,action.payload.groupInfo,state.groups);
            const updatedDashboards = removeGroupFromDashboard(action.payload.rowData,state.dashboards,action.payload.groupInfo);
            return {...state,dashboards:updatedDashboards,groups:updatedGroups}
        // handles the giving permission to a group scenario
        case ACTION_CONSTANTS.UPDATE_DASH_GROUPS_ADD:
            const updatedGroupsAfterAdding = adddashboardToGroup(action.payload.rowData,action.payload.groupInfo,state.groups);
            const updatedDashboardsAfterAdding = addGroupToDashboard(action.payload.rowData,state.dashboards,action.payload.groupInfo);
            return {...state,dashboards:updatedDashboardsAfterAdding,groups:updatedGroupsAfterAdding}
        // fetch the fresh data after update
        case ACTION_CONSTANTS.INITIATE_UPDATE:
            return {...state,isGroupUpdated:false,isUpdating:true}
        
        case ACTION_CONSTANTS.UPDATE_ERROR_HANDLE:
            return {...state,isUpdating:false,updateError:true,error:action.payload}

        default:
            return state;
    }
}

export const checkDashboardIngroups = (dashboard,groups)=>{
    let approvedGroups = [];

    for (let group of groups){
        let dashboardIdsInGroupsArray = group.dashboards.map(item=> Number(Object.keys(item)[0]));
        if(dashboardIdsInGroupsArray.includes(dashboard.id )){
            approvedGroups.push({name:group.name,id:group.id})
        }
    }
 
    return approvedGroups;
   
}


export const removeDashboardFromGroup = (dashboard,propGroup,stateGroup)=>{

    let newGroupstate = [...stateGroup];

    for(let group of newGroupstate){
        if(group.id === propGroup.id){
            group.dashboards = group.dashboards.filter(item => Number(Object.keys(item)[0]) !== dashboard.id)
        }
    }

    return newGroupstate;
    
}

export const removeGroupFromDashboard = (propDashboard,stateDashboard,group)=>{
    let newDashboard = [...stateDashboard];
    for(let dash of newDashboard){
        if(dash.id === propDashboard.id){
            let newApprovedGroups = dash.approvedGroups.filter(val=> val.id !== group.id );
            dash["approvedGroups"] = newApprovedGroups;
        }
    }
    return newDashboard;
}


export const adddashboardToGroup = (dashboard,propGroup,stateGroup)=>{
    let newGroupstate = [...stateGroup];
    let newDashObj = {};
    newDashObj[dashboard.id] = dashboard.name;
    for( let group of newGroupstate){
        if(group.id === propGroup.id){
            group.dashboards.push(newDashObj)
        }
    }
    return newGroupstate;
}

export const addGroupToDashboard = (propDashboard,stateDashboard,group)=>{
    let newDashboard = [...stateDashboard];
    for(let dash of newDashboard){
        if(dash.id === propDashboard.id){
            dash.approvedGroups.push({name:group.name,id:group.id});
        }
    }
    return newDashboard;
}

export default dashboards;