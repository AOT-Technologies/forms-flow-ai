import notification from "@/services/notification";

function addOnlineListener(notificationKey) {
  function onlineStateHandler() {
    notification.close(notificationKey);
    window.removeEventListener("online", onlineStateHandler);
  }
  window.addEventListener("online", onlineStateHandler);
}

export default {
  init() {
    window.addEventListener("offline", () => {
      notification.warning("Please check your Internet connection.", null, {
        key: "connectionNotification",
        duration: null,
      });
      addOnlineListener("connectionNotification");
    });
  },
};
