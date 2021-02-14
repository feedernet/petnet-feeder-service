import { modals } from "../constants";

const snackModalReducer = (
  state = { show: false, deviceHid: null, defaultPortion: 0.0625 },
  action
) => {
  switch (action.type) {
    case modals.SHOW_SNACK_MODAL:
      return {
        show: true,
        deviceHid: action.deviceHid,
        defaultPortion: action.defaultPortion,
      };
    case modals.DISMISS_SNACK_MODAL:
      return {
        show: false,
        deviceHid: null,
        defaultPortion: 0.0625,
      };
    default:
      return state;
  }
};

export default snackModalReducer;
