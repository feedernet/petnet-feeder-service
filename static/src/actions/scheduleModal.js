import { modals } from "../constants";

export const dismissScheduleModal = () => {
  return {
    type: modals.DISMISS_SCHEDULE_MODAL,
    pet: {},
  };
};

export const showScheduleModal = (pet) => {
  return {
    type: modals.SHOW_SCHEDULE_MODAL,
    pet,
  };
};
