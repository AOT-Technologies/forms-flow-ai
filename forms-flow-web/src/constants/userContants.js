//TODO make it dynamic from env
/* istanbul ignore file */
import {KEYCLOAK_ENABLE_CLIENT_AUTH} from "../constants/constants";

export const REVIEWER_GROUP = KEYCLOAK_ENABLE_CLIENT_AUTH ? "formsflow-reviewer" : "formsflow/formsflow-reviewer";
