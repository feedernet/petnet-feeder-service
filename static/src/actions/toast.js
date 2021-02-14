import { toast } from "../constants";

export const dismissToast = (id) => {
  return {
    type: toast.DISMISS_TOAST,
    id,
  };
};

export const triggerToast = (title, message, button) => {
  return {
    type: toast.TRIGGER_TOAST,
    title,
    message,
    button,
  };
};
