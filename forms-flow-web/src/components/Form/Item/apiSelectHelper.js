import {
  applicationCreate,
  publicApplicationCreate,
} from "../../../apiManager/services/applicationServices";
import {
  draftSubmit,
  publicDraftSubmit,
} from "../../../apiManager/services/draftService";
/**
 * Function to select which application create API to use based on application state.
 * @param {boolean} isAuthenticated - Is the client authenticated
 * @param {boolean} isDraftCreated - Is there any drafts created against the form.
 * @param {boolean} isDraftEnabled - Wheather or not draft feature is enabled.
 * @returns {object} - an action that trigger corresponding API call.
 */
const selectApplicationCreateAPI = (
  isAuthenticated,
  isDraftCreated,
  isDraftEnabled
) => {
  let useDraftSubmission = isAuthenticated && isDraftEnabled && isDraftCreated;
  let useApplicationCreate =
    isAuthenticated && !isDraftEnabled && !isDraftCreated;
  let usePublicApplicationCreate =
    !isAuthenticated && !isDraftEnabled && !isDraftCreated;
  let usePublicDraftSubmit =
    !isAuthenticated && isDraftEnabled && isDraftCreated;
  let selection = null;

  if (useDraftSubmission) selection = draftSubmit;
  if (useApplicationCreate) selection = applicationCreate;
  if (usePublicApplicationCreate) selection = publicApplicationCreate;
  if (usePublicDraftSubmit) selection = publicDraftSubmit;

  return selection;
};

export default selectApplicationCreateAPI;
