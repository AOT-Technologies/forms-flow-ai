import { Route, Switch } from 'react-router-dom'
import React from 'react'
import List from './List';
import Create from './Create';
import Item from './Item/index'

const Form = () => (
  <div>
    <Switch>
      <Route exact path="/form" component={List} />
      <Route exact path="/form/create" component={Create} />
      <Route path="/form/:formId" component={Item} />
    </Switch>
  </div>
)

export default Form


