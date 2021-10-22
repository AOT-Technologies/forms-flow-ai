import React, {useEffect} from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import ApplicationList from './List';
import ViewApplication from './ViewApplication';
import './Application.scss';
import { setCurrentPage } from '../../actions/bpmActions';

export default React.memo(() => {
  const showApplications= useSelector((state) => state.user.showApplications);
  const dispatch= useDispatch();

  useEffect(()=>{
    dispatch(setCurrentPage('application'))
  },[dispatch]);

  return (
    <div className="container" id="main">
      <Switch>
        {showApplications?<>
        <Route exact path="/application" component={ApplicationList} />
        <Route path="/application/:applicationId"><ViewApplication/></Route>
        <Route path="/application/:applicationId/:notavailable"><Redirect exact to='/404'/></Route>
        </>:null }
      </Switch>
    </div>
  )
});
