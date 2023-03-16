//TODO make it dynamic from env
/* istanbul ignore file */
import {MULTITENANCY_ENABLED} from "../constants/constants";
export const REVIEWER_GROUP = MULTITENANCY_ENABLED ? "formsflow-reviewer" : "formsflow/formsflow-reviewer";
