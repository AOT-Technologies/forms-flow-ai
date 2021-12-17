 /* istanbul ignore file */
import ACTION_CONSTANTS from "./actionConstants";

export const toggleMenu = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.TOGGLE_MENU,
    payload:data
  })
}
