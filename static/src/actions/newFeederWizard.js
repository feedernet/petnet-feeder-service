import { modals } from "../constants";

export const dismissFeederWizard = () => {
  return {
    type: modals.DISMISS_FEEDER_WIZARD,
    deviceHid: null,
  };
};

export const showFeederWizard = (deviceHid) => {
  return {
    type: modals.SHOW_FEEDER_WIZARD,
    deviceHid,
  };
};
