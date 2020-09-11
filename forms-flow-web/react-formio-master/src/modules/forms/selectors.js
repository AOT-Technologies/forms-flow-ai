import {selectRoot} from '../root';

export const selectForms = (name, state) => selectRoot(name, state).forms;
