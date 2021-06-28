import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import {BPM_BASE_URL_SOCKET_IO} from "../apiManager/endpoints/config";
import UserService from "./UserService";
import {WEBSOCKET_ENCRYPT_KEY} from "../constants/socketIOConstants";
import AES from 'crypto-js/aes';

let stompClient = null;
let reconnectTimeOut=null;

const connect = (reloadCallback)=>{
  const accessToken= AES.encrypt(UserService.getToken(),WEBSOCKET_ENCRYPT_KEY).toString();
  const socketUrl=`${BPM_BASE_URL_SOCKET_IO}?accesstoken=${accessToken}`;
  const socket = new SockJS(socketUrl);
  stompClient = Stomp.over(socket);
  stompClient.debug = null;
  stompClient.connect({}, function(){
    if(isConnected()){
      stompClient.subscribe('/topic/task-event', function(output){
        const taskUpdate = JSON.parse(output.body);
        reloadCallback(taskUpdate.id);
      });
    }
  },function (error){
    console.log(error);
    /* Try reconnect the websocket connection again after 5 seconds only if still in task page
     and failure happens due to network/rebuilding time. */
    if(window.location.pathname.includes('task')){
      reconnectTimeOut = setTimeout(()=>{
        connect(reloadCallback);
      }, 5000);
    }
  });
}

const isConnected = ()=>{
 return stompClient?.connected||null;
};

const disconnect = ()=>{
  stompClient.disconnect();
  clearTimeout(reconnectTimeOut);
}

const SocketIOService = {
  connect,
  disconnect,
  isConnected
};

export default SocketIOService;
