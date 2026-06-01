import { createContext, useContext, useState } from "react";

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  // snackModal: { show, deviceHid, defaultPortion }
  const [snack, setSnack] = useState({
    show: false,
    deviceHid: null,
    defaultPortion: 0.0625,
  });

  // editFeeder: { show, feeder, defaultPortion }
  const [editFeeder, setEditFeeder] = useState({
    show: false,
    feeder: {},
    defaultPortion: 0.0625,
  });

  // editPet: { show, pet }
  const [editPet, setEditPet] = useState({
    show: false,
    pet: {},
  });

  // schedule: { show, pet }
  const [schedule, setSchedule] = useState({
    show: false,
    pet: {},
  });

  // newFeederWizard: { show, deviceHid }
  const [newFeederWizard, setNewFeederWizard] = useState({
    show: false,
    deviceHid: null,
  });

  return (
    <ModalContext.Provider
      value={{
        snack,
        setSnack,
        editFeeder,
        setEditFeeder,
        editPet,
        setEditPet,
        schedule,
        setSchedule,
        newFeederWizard,
        setNewFeederWizard,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export const useModals = () => useContext(ModalContext);
