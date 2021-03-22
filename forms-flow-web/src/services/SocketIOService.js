import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import {BPM_BASE_URL_SOCKET_IO} from "../apiManager/endpoints/config";
import UserService from "./UserService";
import {WEBSOCKET_ENCRYPT_KEY} from "../constants/socketIOConstants";
import AES from 'crypto-js/aes';

let stompClient = null;

const connect = ()=>{
  const accessToken= AES.encrypt(UserService.getToken(),WEBSOCKET_ENCRYPT_KEY).toString();
  console.log("CryptoJS.AES.encrypt",accessToken);
  const socket = new SockJS(`${BPM_BASE_URL_SOCKET_IO}?accesstoken=${accessToken}`);
  console.log("socket", socket);


  stompClient = Stomp.over(socket);
  console.log("stompClient", stompClient);
  stompClient.connect(function(frame){
    console.log("frame hereeeeeeee");
    stompClient.subscribe('/topic/task-event-details', function(output){
      console.log("test task event",output,JSON.parse(output.body));
    });
    stompClient.subscribe('/topic/task-event', function(output){
      alert("event");
      console.log("test task event",output,JSON.parse(output.body));
    });
  })
  stompClient.connect({}, function(frame){
    console.log('Connected: ' + frame);
    stompClient.subscribe('/topic/task-event-details', function(output){
      console.log("test task event",output,JSON.parse(output.body));
    });
    stompClient.subscribe('/topic/task-event', function(output){
      alert("event");
      console.log("test task event",output,JSON.parse(output.body));
    });
  });
}

const disconnect = ()=>{
  stompClient.disconnect();
  console.log("Disconnected");
}

const SocketIOService = {
  connect,
  disconnect
};

export default SocketIOService;
