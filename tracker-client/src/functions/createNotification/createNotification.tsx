import ReactDOM from "react-dom/client";
import {
  notification,
  alert as alertClass,
  defaultClass,
  clearInputs,
} from "./notificationStyles.module.css";

const getNewNotificationTopOffset = (
  notificationsElement: HTMLElement | null,
) => {
  const lastNotification =
    notificationsElement?.lastElementChild?.firstElementChild;
  if (lastNotification) {
    const { y, height } = lastNotification.getBoundingClientRect();
    return Math.max(0, y + height);
  } else {
    return 0;
  }
};

const notificationClasses = {
  alert: alertClass,
  default: defaultClass,
  clearInputs,
};

const createNotification = (
  text: string,
  style: keyof typeof notificationClasses,
) => {
  let animationCount = 0;
  const onAnimationEnd = () => {
    if (animationCount === 1) {
      root.unmount();
      alertContainer.remove();
    }
    animationCount++;
  };
  const alertContainer = document.createElement("div");
  const root = ReactDOM.createRoot(alertContainer);
  const notificationsElement = document.getElementById("notifications");
  const newNotificationTopOffset = `${getNewNotificationTopOffset(
    notificationsElement,
  )}px`;
  if (notificationsElement) notificationsElement.append(alertContainer);

  root.render(
    <div
      className={`${notification} ${notificationClasses[style]}`}
      onAnimationEnd={onAnimationEnd}
      style={{ top: newNotificationTopOffset }}
    >
      {text}
    </div>,
  );
};

let nextTick: NodeJS.Timeout | false = false;

export const getCreateNotification =
  (text: string, style: keyof typeof notificationClasses = "default") =>
  () => {
    if (!nextTick) {
      nextTick = setTimeout(() => {
        nextTick = false;
        createNotification(text, style);
      }, 300);
    }
  };
