import React from 'react'
import { Route, Switch } from 'react-router-dom'

import List from './List'
import View from './View'
import './Task.scss'

const Task = () => {
  return (
    <div className="container" id="main">
      <Switch>
        <Route exact path="/task" component={List} />
        <Route path="/task/:id"><View/></Route>
      </Switch>
    </div>
  )
}

export default Task;
