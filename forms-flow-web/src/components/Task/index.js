import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { connect } from 'react-redux'

import { fetchTaskList } from '../../apiManager/services/taskServices';
import List from './List';
import ViewTask from './ViewTask';
import './Task.scss';
import { setCurrentPage } from '../../actions/bpmActions';

const Task = () => {
  return (
    <div className="container" id="main">
      <Switch>
        <Route exact path="/task" component={List} />
        <Route path="/task/:id"><ViewTask/></Route>
      </Switch>
    </div>
  )
}

const mapDispatchToProps=(dispatch)=>{
  return{
    setCurrentPage:dispatch(setCurrentPage('task')),
    getTasks:dispatch(fetchTaskList((err, res) => {
            if (!err) {
              console.log(res);
            }
          })
    )
  }
}

export default connect(null,mapDispatchToProps)(Task);
