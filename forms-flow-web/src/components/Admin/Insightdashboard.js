import React,{useEffect,useState,useRef} from "react";
import { Button } from "react-bootstrap";
import BootstrapTable from 'react-bootstrap-table-next';
import {useDispatch} from "react-redux";
import ListGroup from 'react-bootstrap/ListGroup'
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Errors } from "react-formio/lib/components";
import Loading from "../../containers/Loading";
import { connect } from "react-redux";
import { updateGroup } from "../../apiManager/services/dashboardsService";
import Popover from '@material-ui/core/Popover';
import { initiateUpdate, updateDashboardFromGroups } from "../../actions/dashboardActions";

export const InsightDashboard = (props)=> {

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

  const [anchorEl, setAnchorEl] = useState(null);

  const [remainingGroups,setRemainingGroups] = useState([]); 
  const [activeRow,setActiveRow] = useState(null);
  const [show, setShow] = useState(false);
  const [activePage,setActivePage] = useState(1);
  const [sizePerPage,setSizePerPage] = useState(5)
  const useNoRenderRef = (currentValue)=>{
    const ref = useRef(currentValue);
    ref.current = currentValue;
    return ref;
  }

  const getDashboardsRef = useNoRenderRef(dashboards);

  useEffect(()=>{
    if(isDashUpdated && isGroupUpdated){
     dispatch(updateDashboardFromGroups({dashboards:getDashboardsRef.current,groups}));
    }
  },[isGroupUpdated,isDashUpdated,getDashboardsRef,dispatch,groups])


   // handles the add button click event
   const handleClick = (event,rowData) => {
    let approvedGroupIds =rowData.approvedGroups.map(x => x.id);
    let listGroup = groups.filter(item=>approvedGroupIds.includes(item.id)===false)
    setActiveRow(rowData);
    setRemainingGroups(listGroup)
    setShow(!show);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setShow(false)
    setAnchorEl(null);
  };

  const id = show ? 'simple-popover' : undefined;
  const removeDashboardFromGroup = (rowData,groupInfo)=>{
      let groupToUpdate = groups.find(group=>group.id === groupInfo.id);
      let updatedDashboardsForSelectedGroup = groupToUpdate.dashboards.filter(item => Number(Object.keys(item)[0]) !== rowData.id);
      let update = {
        dashboards:updatedDashboardsForSelectedGroup,
        group:groupInfo.id
      }
      dispatch(initiateUpdate());
      setShow(false)  
      dispatch(updateGroup(update));
    
  }

  const AddDashboardToGroup = (groupInfo)=>{
    let newGroups = [...groups];
    let newDashObj = {};
    let update = {};
    newDashObj[activeRow.id] = activeRow.name;
    for( let group of newGroups){
        if(group.id === groupInfo.id){
            group.dashboards.push(newDashObj);
            update = {
              dashboards:group.dashboards,
              group:group.id
            }
        }
    }
      dispatch(initiateUpdate())
      setShow(!show)
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
        <div key={label.id} className="pull-left group-item-container">
            <Button className="btn btn-secondary btn-sm form-btn pull-left btn-left group-item" disabled>{label.name} </Button>
            <Button data-testid={rowData.name+label.name} variant="outline-secondary" className="btn-sm close-button" onClick={(e)=>removeDashboardFromGroup(rowData,label)}>x</Button>
        </div>
          )}
            </>
    }
   },
   {
    dataField: 'id',
    text: 'Action',
    formatExtraData :{show,remainingGroups},
    formatter: (cell,rowData,rowIdx,formatExtraData) => {

      let {show,remainingGroups} = formatExtraData;
      return <div>
                <Button data-testid={rowIdx}  
                  onClick={(e)=>handleClick(e,rowData)} 
                  className="btn btn-primary btn-md form-btn pull-left btn-left"> Add <b>+</b>
                </Button> 
                <Popover
                    data-testid="popup-component"
                    id={id}
                    open={show}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'center',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'center',
                    }}
                  >
                  <ListGroup>
                    {remainingGroups.length > 0 
                    ? 
                      remainingGroups.map((item,key)=><ListGroup.Item key={key} as="button" 
                      onClick={()=>AddDashboardToGroup(item)}>{item.name}</ListGroup.Item>)
                    :
                      <ListGroup.Item>{`All groups have access to the dashboard`}</ListGroup.Item>
                    }
                  </ListGroup>
              </Popover>
            </div>
    }
  }
];

const getpageList = ()=>{
  const list = [ 
        {
        text: '5', value: 5
      },
        {
        text: '25', value: 25
      },
        {
        text: '50', value: 50
      },
        {
        text: '100', value: 100
      },
        {
        text: 'All', value: dashboards.length
      } ]
  return list
}

const handleSizeChange = (sizePerPage,page)=>{
    setActivePage(page)
    setSizePerPage(sizePerPage)
}

  const pagination = paginationFactory({
    showTotal :true,
    sizePerPageList:getpageList(),
    page:activePage,
    sizePerPage:sizePerPage,
    onPageChange :(page)=>setActivePage(page),
    onSizePerPageChange:(size,page)=>handleSizeChange(size,page)
  })

  return (
     <>
        <div className="flex-container">
          <div className="flex-item-left">
          <h3 className="task-head">
          <span><i className="fa fa-wpforms" aria-hidden="true"/></span>
             <span className="forms-text">Dashboard</span></h3>
          </div>
          {updateError && <div className="error-container error-custom"><Errors errors={error} /></div>}
        </div>
        <section  className="custom-grid grid-forms">
          {isloading ?isError ? <Errors errors={error} />:<Loading /> :<BootstrapTable keyField='id' data={ dashboards } columns={ columns } pagination={pagination} />}
        </section>
     </>
    );
};

const mapStateToProps = (state)=>{
  return {
    dashboardReducer:state.dashboardReducer 
  }
}


export default connect(mapStateToProps)(InsightDashboard);
