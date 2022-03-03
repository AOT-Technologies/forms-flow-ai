import { httpPUTRequest } from "../httpRequestHandler";
import API from '../endpoints/index'
import UserService from "../../services/UserService";
import { toast } from "react-toastify";
import { Translation } from "react-i18next";


export const updateUserlang = (data)=>{
  const apiUpdatelang = API.LANG_UPDATE
    
    

  return (dispatch) => {
    httpPUTRequest(apiUpdatelang,{"locale":data},UserService.getToken())
    .then((res)=>{
      if(res.data){
          toast.success(<Translation>{(t)=>t("successfully_updated")}</Translation>);
        
      }else{
          toast.error(<Translation>{(t)=>t("failed")}</Translation>);
        
        }
      }
    )
    .catch((error)=>{
        console.log(error);
      toast.error(<Translation>{(t)=>t("failed")}</Translation>);
    })
    
  }
}
