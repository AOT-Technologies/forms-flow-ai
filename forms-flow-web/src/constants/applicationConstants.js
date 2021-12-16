/* istanbul ignore file */
export const RESUBMITTED_STATUS_EVENT = "application_resubmitted";
export const ACKNOWLEDGED_EVENT="application_acknowledged"

//export const RETURNED_STATUS = "Returned";
export const RESUBMIT_STATUS = "Resubmit";
export const AWAITING_ACKNOWLEDGEMENT="Awaiting Acknowledgement"
//export const NEW_STATUS = "New";

export const CLIENT_EDIT_STATUS = [AWAITING_ACKNOWLEDGEMENT, RESUBMIT_STATUS];

export const UPDATE_EVENT_STATUS = [RESUBMIT_STATUS, AWAITING_ACKNOWLEDGEMENT];


export const getProcessDataReq = (applicationDetail)=>{
  const data = {
    "messageName" : "",
    "processInstanceId": applicationDetail.processInstanceId
  }

  switch(applicationDetail.applicationStatus){
    case AWAITING_ACKNOWLEDGEMENT: data.messageName = ACKNOWLEDGED_EVENT;
    break;
    case RESUBMIT_STATUS:
      data.messageName = RESUBMITTED_STATUS_EVENT;
    break;
    default: return null;  //TODO check
  };
  return data;
}
