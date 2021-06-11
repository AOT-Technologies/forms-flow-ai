import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import {BPM_BASE_URL_SOCKET_IO} from "../apiManager/endpoints/config";
import UserService from "./UserService";
import {WEBSOCKET_ENCRYPT_KEY} from "../constants/socketIOConstants";
import AES from 'crypto-js/aes';

let stompClient = null;

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
  });
}

const isConnected = ()=>{
 return stompClient?.connected||null;
};

const disconnect = ()=>{
  stompClient.disconnect();
}

const SocketIOService = {
  connect,
  disconnect,
  isConnected
};

export default SocketIOService;
