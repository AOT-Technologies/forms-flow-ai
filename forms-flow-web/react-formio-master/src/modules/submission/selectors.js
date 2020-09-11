import {selectRoot} from '../root';

export const selectSubmission = (name, state) => selectRoot(name, state).submission;
