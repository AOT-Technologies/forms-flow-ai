import {combineReducers} from "redux";
import {connectRouter} from "connected-react-router";
import { form, forms, submission, submissions } from 'react-formio';

import user from "./userDetailReducer";
import tasks from "./tasksReducer";

const createRootReducer = (history) => combineReducers({
  user,
  tasks,
  form: form({name: 'form'}),
  forms: forms({ name: 'forms', query: {type: 'form', tags: 'common'} }),
  submission: submission({name: 'submission'}),
  submissions: submissions({name: 'submissions'}),
  router: connectRouter(history),
});

export default createRootReducer;
