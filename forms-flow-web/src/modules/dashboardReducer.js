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
    updateError:false
		
}


const dashboards = (state=initialState,action)=>{
    switch(action.type){
       
        case ACTION_CONSTANTS.DASHBOARDS_LIST:
            let dashboards = action.payload.results.map(result=>({'id':result.id,name:result.name}));
            return {...state,dashboards:dashboards,isDashUpdated:true};

        case ACTION_CONSTANTS.DASHBOARDS_LIST_ERROR:
            return {...state,iserror:true,error:action.payload}

        case ACTION_CONSTANTS.DASHBOARDS_LIST_GROUPS:
            
            return {...state,groups:action.payload,isGroupUpdated:true,updateError:false}

        case ACTION_CONSTANTS.DASHBOARDS_MAP_FROM_GROUPS:

            let dashboardsFromState = [...action.payload.dashboards];
            let groups = [...action.payload.groups];
            for(let dashboard of dashboardsFromState){
               let res =  checkDashboardIngroups(dashboard,groups)
               dashboard.approvedGroups = res;
            }

            return {...state,dashboards:dashboardsFromState,isloading:false}
        
        case ACTION_CONSTANTS.DASHBOARDS_CLEAN_UP:
            return {...state,isDashUpdated:false,isGroupUpdated:false,isloading:true}

        // fetch the fresh data after update
        case ACTION_CONSTANTS.DASHBOARDS_INITIATE_UPDATE:
            return {...state,isloading:true,isDashUpdated:false,isGroupUpdated:false}
        
        case ACTION_CONSTANTS.DASHBOARDS_UPDATE_ERROR:
            return {...state,updateError:true,error:action.payload,isloading:false}
        
        case ACTION_CONSTANTS.DASHBOARDS_HIDE_UPDATE_ERROR:
            return {...state,updateError:false}

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
export default dashboards;
