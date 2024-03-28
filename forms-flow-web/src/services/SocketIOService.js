import SockJS from "sockjs-client";
import { BPM_BASE_URL_SOCKET_IO } from "../apiManager/endpoints/config";
import { WEBSOCKET_ENCRYPT_KEY } from "../constants/socketIOConstants";
import AES from "crypto-js/aes";
import { MULTITENANCY_ENABLED } from "../constants/constants";
import { StorageService } from "@formsflow/service";

let tenantData = localStorage.getItem("tenantData");
let tenantKey = '';
if (tenantData) {
  tenantData = JSON.parse(tenantData);
  tenantKey = tenantData["key"];
}

let socket = null;
let reconnectTimeOut = null;

const connect = (reloadCallback) => {
  const accessToken = AES.encrypt(
    StorageService.get(StorageService.User.AUTH_TOKEN),
    WEBSOCKET_ENCRYPT_KEY
  ).toString();
  const socketUrl = `${BPM_BASE_URL_SOCKET_IO}?accesstoken=${accessToken}`;
  socket = new SockJS(socketUrl);

  socket.onopen = function () {
    console.log("WebSocket connection established.");
    socket.send("Connected to WebSocket server.");
  };

  socket.onmessage = function (event) {
    const taskUpdate = JSON.parse(event.data);

    if (MULTITENANCY_ENABLED && tenantKey !== taskUpdate.tenantId) {
      // Ignore this subscription if multitenancy is enabled and tenantkey doesn't match
      return;
    } else {
      const forceReload = taskUpdate.eventName === "complete";
      const isUpdateEvent = taskUpdate.eventName === "update";
      reloadCallback(taskUpdate.id, forceReload, isUpdateEvent);
    }
  };

  socket.onclose = function () {
    console.log("WebSocket connection closed.");
    // Try reconnecting the websocket connection again after 5 seconds only if still in task page
    // and failure happens due to network/rebuilding time.
    if (window.location.pathname.includes("task")) {
      reconnectTimeOut = setTimeout(() => {
        connect(reloadCallback);
      }, 5000);
    }
  };
};

const isConnected = () => {
  return socket?.readyState === SockJS.OPEN || null;
};

const disconnect = () => {
  if (socket) {
    socket.close();
  }
  clearTimeout(reconnectTimeOut);
};

const SocketIOService = {
  connect,
  disconnect,
  isConnected,
};

export default SocketIOService;
