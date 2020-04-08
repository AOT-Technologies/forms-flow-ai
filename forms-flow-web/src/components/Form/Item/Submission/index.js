import { Route, Switch } from 'react-router-dom'
import React from 'react'
import List from './List'
import Item from './Item/index'

const Form = () => (
  <div>
    <Switch>
      <Route exact path="/:formId/submission" component={List} />
      <Route path="/:formId/submission/:submissionId" component={Item} />
    </Switch>
  </div>
)

export default Form
