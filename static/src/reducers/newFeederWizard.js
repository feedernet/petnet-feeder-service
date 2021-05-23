import { modals } from "../constants";

const newFeederWizardReducer = (
  state = { show: false, deviceHid: null },
  action
) => {
  switch (action.type) {
    case modals.SHOW_FEEDER_WIZARD:
      return {
        show: true,
        deviceHid: action.deviceHid,
      };
    case modals.DISMISS_FEEDER_WIZARD:
      return {
        show: false,
        deviceHid: null,
      };
    default:
      return state;
  }
};

export default newFeederWizardReducer;
