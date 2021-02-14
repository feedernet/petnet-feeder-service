import { modals } from "../constants";

export const dismissEditPetModal = () => {
  return {
    type: modals.DISMISS_EDIT_PET_MODAL,
    pet: {},
  };
};

export const showEditPetModal = (pet) => {
  return {
    type: modals.SHOW_EDIT_PET_MODAL,
    pet,
  };
};
