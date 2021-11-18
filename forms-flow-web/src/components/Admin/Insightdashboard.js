import React,{useEffect,useState,useRef} from "react";
import { Button } from "react-bootstrap";
import BootstrapTable from 'react-bootstrap-table-next';
import {useDispatch} from "react-redux";
import ACTION_CONSTANTS from "../../actions/actionConstants";
import Overlay from 'react-bootstrap/Overlay'
import Popover from 'react-bootstrap/Popover'
import ListGroup from 'react-bootstrap/ListGroup'
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Errors } from "react-formio/lib/components";
import Loading from "../../containers/Loading";
import { connect } from "react-redux";
import { updateGroup } from "../../apiManager/services/dashboardsService";

export const InsightDashboard = React.memo((props)=> {

  const {dashboardReducer} = props;
  const dispatch= useDispatch();
  const dashboards = dashboardReducer.dashboards;
  const groups = dashboardReducer.groups;
  const isGroupUpdated = dashboardReducer.isGroupUpdated;
  const isDashUpdated = dashboardReducer.isDashUpdated;
  const isloading = dashboardReducer.isloading;
  const isError =  dashboardReducer.iserror;
  const error = dashboardReducer.error;
  const updateError = dashboardReducer.updateError;
  const isUpdating = dashboardReducer.isUpdating;

  const [remainingGroups,setRemainingGroups] = useState([]); 
  const [activeRow,setActiveRow] = useState(null);
  const [show, setShow] = useState(false);
  const [target, setTarget] = useState(null);
  const ref = useRef(null);


  useEffect(()=>{
    if(isDashUpdated && isGroupUpdated){
      dispatch({
        type:ACTION_CONSTANTS.UPDATE_DASHBOARDS_FROM_GROUPS,
        payload:{dashboards,groups}
      })
    }
  },[isGroupUpdated,isDashUpdated])

   // handles the add button click event
   const handleClick = (event,rowData) => {
    let approvedGroupIds =rowData.approvedGroups.map(x => x.id);
    let listGroup = groups.filter(item=>approvedGroupIds.includes(item.id)===false)
    setActiveRow(rowData);
    setRemainingGroups(listGroup)
    setTarget(event.target);
    setShow(!show);
  };


  const removeDashboardFromGroup = (rowData,groupInfo)=>{
      dispatch({
        type:ACTION_CONSTANTS.UPDATE_DASH_GROUPS,
        payload:{groupInfo:groupInfo,rowData:rowData}
      });
      dispatch({
        type:ACTION_CONSTANTS.INITIATE_UPDATE,
        payload:null
      })
      setShow(false)
      const data = groups.find(group=>group.id === groupInfo.id);
      const update = {
        dashboards:data.dashboards,
        group:data.id
      }
       dispatch(updateGroup(update));
    
  }

  const AddDashboardToGroup = (groupInfo)=>{
    dispatch({
      type:ACTION_CONSTANTS.UPDATE_DASH_GROUPS_ADD,
      payload:{groupInfo:groupInfo,rowData:activeRow}
    });
    dispatch({
      type:ACTION_CONSTANTS.INITIATE_UPDATE,
      payload:null
    })
    setShow(!show)
     const data = groups.find(group=>group.id === groupInfo.id);
     const update = {
       dashboards:data.dashboards,
       group:data.id
     }
      dispatch(updateGroup(update));
  }

  const columns = [
    {
    dataField: 'name',
    text: 'Dashboard',
    },
   {
    dataField: 'approvedGroups',
    text: 'Access Groups',
    formatter: (cell,rowData) => {
      return  <> 
                {cell?.map(label => 
                <div key={label.id} style={{display:'flex',paddingRight:0,marginRight:10,marginBottom:5,marginTop:5}} className="pull-left">
                    <Button  style={{marginRight:'10px',cursor:'default',marginRight:0}} className="btn btn-secondary btn-sm form-btn pull-left btn-left" disabled>{label.name} </Button>
                  <Button data-testid={rowData.name+label.name} variant="outline-secondary" style={{marginLeft:5}} className="btn-sm" onClick={(e)=>removeDashboardFromGroup(rowData,label)}>x</Button>
                </div>
                 )}
              </>
    }
   },
   {
    dataField: 'id',
    text: 'Action',
    formatExtraData :{show,target,ref,remainingGroups},
    formatter: (cell,rowData,rowIdx,formatExtraData) => {

      let {show,target,ref,remainingGroups} = formatExtraData;
      return <div>
                <Button data-testid={rowIdx}  onClick={(e)=>handleClick(e,rowData)} className="btn btn-primary btn-md form-btn pull-left btn-left"> Add <b>+</b> </Button> 
              { show && <Overlay
                  show={show}
                  target={target}
                  placement="bottom"
                  container={ref}
                  containerPadding={20}
                >
                <Popover data-testid="popup-component" id="popover-contained">
                  <ListGroup>
                      {remainingGroups.length > 0 ? remainingGroups.map((item,key)=><ListGroup.Item key={key} as="button" onClick={()=>AddDashboardToGroup(item)}>{item.name}</ListGroup.Item>):<ListGroup.Item>{`All groups have access to the dashboard`}</ListGroup.Item>}
                 </ListGroup>
                </Popover>
              </Overlay>}
              
            </div>
    }
  }
];

  const pagination = paginationFactory({
    sizePerPage :5,
    showTotal :true
  })


  return (
     <>
        <div className="flex-container">
          <div className="flex-item-left">
          <h3 className="task-head">
          <span><i className="fa fa-wpforms" aria-hidden="true"/></span>
             <span className="forms-text">Dashboard</span></h3>
          </div>
          {/* need to replace the image icons with some icon package */}
          { isUpdating && <div className="saving-container"><img id="box" className="active" src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Refresh_icon.svg/1200px-Refresh_icon.svg.png" /><h4 className="status-message">Saving changes</h4></div>}
        </div>
        {updateError && <div style={{width:'30%'}} className="error-container"><Errors errors={error} /></div>}
        <section ref={ref} className="custom-grid grid-forms">
          {isloading ?isError ? <Errors errors={error} />:<Loading /> :<BootstrapTable keyField='id' data={ dashboards } columns={ columns } pagination={pagination} />}
        </section>
     </>
    );
});

const mapStateToProps = (state)=>{
  return {
    dashboardReducer:state.dashboardReducer 
  }
}


export default connect(mapStateToProps)(InsightDashboard);
