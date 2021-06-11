import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { connect } from 'react-redux'

import List from './List';
import ViewTask from './ViewTask';
import './Task.scss';
import { setCurrentPage } from '../../actions/bpmActions';

const Task = React.memo(() => {
  return (
    <div className="container" id="main">
      <Switch>
        <Route exact path="/task" component={List} />
        <Route path="/task/:taskId"><ViewTask/></Route>
      </Switch>
    </div>
  )
})

const mapDispatchToProps=(dispatch)=>{
  return{
    setCurrentPage:dispatch(setCurrentPage('task'))
  }
}

export default connect(null,mapDispatchToProps)(Task);
