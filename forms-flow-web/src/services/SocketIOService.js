import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import {BPM_BASE_URL_SOCKET_IO} from "../apiManager/endpoints/config";
import UserService from "./UserService";

let stompClient = null;

const connect = ()=>{
  const socket = new SockJS(BPM_BASE_URL_SOCKET_IO);
  console.log("socket", socket);
  const accessToken= UserService.getToken();

  stompClient = Stomp.over(socket);
  console.log("stompClient", stompClient);
  stompClient.connect({"Authorization": `Bearer ${accessToken}`}, (frame) => {
    //stompClient.connect({}, function (frame) {
    console.log('Connected: ' + frame);
    stompClient.subscribe('/topic/task-event-details', function(output){
      console.log("test task",output,JSON.parse(output.body));
    });
    stompClient.subscribe('/topic/task-event', function(output){
      console.log("test task",output,JSON.parse(output.body));
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
