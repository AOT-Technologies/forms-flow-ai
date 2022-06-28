import { httpPOSTRequest,} from "../httpRequestHandler";
import API from "../endpoints";
import UserService from "../../services/UserService";

export const formCreate = (formData, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  httpPOSTRequest(API.FORM_CREATION,formData,UserService.getToken()).then(res=>{
    if(res.data){
     done(null,res.data);
    }
   }).catch((err)=>{
    if(err.response?.data){
      done(err.response.data);
    }else{
      done(err.message);
    } 
   });
 
 
};
