import { modals } from "../constants";

const editFeederModalReducer = (
  state = {
    show: false,
    feeder: {},
    defaultPortion: 0.0625,
  },
  action
) => {
  switch (action.type) {
    case modals.SHOW_EDIT_FEEDER_MODAL:
      return {
        show: true,
        feeder: action.feeder,
        defaultPortion: action.defaultPortion,
      };
    case modals.DISMISS_EDIT_FEEDER_MODAL:
      return {
        show: false,
        feeder: {},
        defaultPortion: 0.0625,
      };
    default:
      return state;
  }
};

export default editFeederModalReducer;
