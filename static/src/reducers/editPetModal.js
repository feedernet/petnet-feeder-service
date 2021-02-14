import { modals } from "../constants";

const editPetModalReducer = (
  state = {
    show: false,
    pet: {},
  },
  action
) => {
  switch (action.type) {
    case modals.SHOW_EDIT_PET_MODAL:
      return {
        show: true,
        pet: action.pet,
      };
    case modals.DISMISS_EDIT_PET_MODAL:
      return {
        show: false,
        pet: {},
      };
    default:
      return state;
  }
};

export default editPetModalReducer;
