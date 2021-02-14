import { modals } from "../constants";

const scheduleModalReducer = (
  state = {
    show: false,
    pet: {},
  },
  action
) => {
  switch (action.type) {
    case modals.SHOW_SCHEDULE_MODAL:
      return {
        show: true,
        pet: action.pet,
      };
    case modals.DISMISS_SCHEDULE_MODAL:
      return {
        show: false,
        pet: {},
      };
    default:
      return state;
  }
};

export default scheduleModalReducer;
