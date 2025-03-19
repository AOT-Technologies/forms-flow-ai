/* istanbul ignore file */
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { BPM_BASE_URL_SOCKET_IO } from "../apiManager/endpoints/config";
import { WEBSOCKET_ENCRYPT_KEY } from "../constants/socketIOConstants";
import AES from "crypto-js/aes";
import { MULTITENANCY_ENABLED } from "../constants/constants";
import { StorageService } from "@formsflow/service";

let tenantData = localStorage.getItem("tenantData");
let tenantKey = "";
if (tenantData) {
  tenantData = JSON.parse(tenantData);
  tenantKey = tenantData["key"];
}

let stompClient = null;
let reconnectTimeOut = null;

const connect = (reloadCallback) => {
  const accessToken = AES.encrypt(
    StorageService.get(StorageService.User.AUTH_TOKEN),
    WEBSOCKET_ENCRYPT_KEY
  ).toString();
  const socketUrl = `${BPM_BASE_URL_SOCKET_IO}?accesstoken=${accessToken}`;

  stompClient = new Client({
    webSocketFactory: () => new SockJS(socketUrl),
    reconnectDelay: 5000, // Auto-reconnect after 5 seconds
    debug: () => {}, // Disable debug logging
    onConnect: () => {
      console.log("Connected to WebSocket");
      stompClient.subscribe("/topic/task-event", (message) => {
        const taskUpdate = JSON.parse(message.body);
        
        if (MULTITENANCY_ENABLED && tenantKey !== taskUpdate.tenantId) {
          return; // Ignore if tenant does not match
        }

        const forceReload = taskUpdate.eventName === "complete";
        const isUpdateEvent = taskUpdate.eventName === "update";
        reloadCallback(taskUpdate.id, forceReload, isUpdateEvent);
      });
    },
    onStompError: (frame) => {
      console.error("Broker error: ", frame.headers["message"], frame.body);
    },
    onWebSocketClose: () => {
      console.log("WebSocket connection closed. Attempting reconnect...");
    //   if (window.location.pathname.includes("task")) {
    //     reconnectTimeOut = setTimeout(() => connect(reloadCallback), 5000);
    //   }
    },
  });
  stompClient.activate();
};

const isConnected = () => stompClient?.connected || false;

const disconnect = () => {
  if (stompClient) {
    stompClient.deactivate();
    clearTimeout(reconnectTimeOut);
  }
};

const SocketIOUpdatedService = {
  connect,
  disconnect,
  isConnected,
};

export default SocketIOUpdatedService;
