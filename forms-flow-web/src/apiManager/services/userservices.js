import { httpPUTRequest } from "../httpRequestHandler";
import API from '../endpoints/index'
import UserService from "../../services/UserService";
import { toast } from "react-toastify";


export const updateUserlang = (data)=>{
  const apiUpdatelang = API.LANG_UPDATE
    
    

  return (dispatch) => {
    httpPUTRequest(apiUpdatelang,{"locale":data},UserService.getToken())
    .then((res)=>{
      if(res.data){
          toast.success("Successfully Updated");
        
      }else{
          toast.error("Failed");
        
        }
      }
    )
    .catch((error)=>{
        console.log(error);
      toast.error("Failed");
    })
  }
}
