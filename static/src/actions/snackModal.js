import { modals } from "../constants";

export const dismissSnackModal = () => {
  return {
    type: modals.DISMISS_SNACK_MODAL,
    deviceHid: null,
  };
};

export const showSnackModal = (deviceHid, defaultPortion) => {
  return {
    type: modals.SHOW_SNACK_MODAL,
    deviceHid,
    defaultPortion,
  };
};
