import {selectRoot} from '../root';

export const selectSubmissions = (name, state) => selectRoot(name, state).submissions;
