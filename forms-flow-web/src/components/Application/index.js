import React, {useEffect} from 'react'
import { Route, Switch } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import ApplicationList from './List';
import ViewApplication from './ViewApplication';
import './Application.scss';
import { setCurrentPage } from '../../actions/bpmActions';

const Application = React.memo(() => {
  const dispatch= useDispatch();

  useEffect(()=>{
    dispatch(setCurrentPage('application'))
  },[dispatch]);

  return (
    <div className="container" id="main">
      <Switch>
        <Route exact path="/application" component={ApplicationList} />
        <Route path="/application/:applicationId"><ViewApplication/></Route>
      </Switch>
    </div>
  )
})

export default Application;
