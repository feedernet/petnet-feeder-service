import { modals } from "../constants";

export const dismissEditFeederModal = () => {
  return {
    type: modals.DISMISS_EDIT_FEEDER_MODAL,
    feeder: {},
    defaultPortion: null,
  };
};

export const showEditFeederModal = (feeder, defaultPortion) => {
  return {
    type: modals.SHOW_EDIT_FEEDER_MODAL,
    feeder,
    defaultPortion,
  };
};
