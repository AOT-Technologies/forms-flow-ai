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
  stompClient.connect({}, function(frame){
    console.log('Connected- frame: ' + frame);
    stompClient.subscribe('/topic/task-event', function(output){
      const taskUpdate = JSON.parse(output.body);
      reloadCallback(taskUpdate.id);
    });
    return stompClient;
  });
}

const isConnected = ()=>{
 return stompClient?.connected||null;
};

const disconnect = ()=>{
  stompClient.disconnect();
  console.log("Disconnected");
}

const SocketIOService = {
  connect,
  disconnect,
  isConnected
};

export default SocketIOService;
